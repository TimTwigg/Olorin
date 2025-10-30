import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Skeleton } from "primereact/skeleton";
import * as api from "@src/controllers/api";
import { EntityOverview } from "@src/models/entity";
import { ModelContext } from "@src/models/modelContext";

interface StatBlockListProps {
    filter: "custom" | "official";
    context: ModelContext;
}

export function StatBlockList({ filter, context: _context }: StatBlockListProps) {
    const [statBlocks, setStatBlocks] = React.useState<EntityOverview[]>([]);
    const [filteredBlocks, setFilteredBlocks] = React.useState<EntityOverview[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [typeFilter, setTypeFilter] = React.useState<string | null>(null);
    const [sourceFilter, setSourceFilter] = React.useState<string | null>(null);
    const [crMinFilter, setCrMinFilter] = React.useState<number | null>(null);
    const [crMaxFilter, setCrMaxFilter] = React.useState<number | null>(null);

    const PAGE_SIZE = 50;

    const loadStatBlocks = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.getEntities(currentPage);
            const blocks = response.Entities as EntityOverview[];

            // Filter by custom vs official based on Source field
            const filtered = blocks.filter((block) => {
                const isCustom = block.Source === "Homebrew" || block.Source === "Custom";
                return filter === "custom" ? isCustom : !isCustom;
            });

            setStatBlocks(filtered);
        } catch (error) {
            console.error("Failed to load stat blocks:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, filter]);

    const filterStatBlocks = React.useCallback(() => {
        let filtered = [...statBlocks];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((block) => block.Name.toLowerCase().includes(query));
        }

        // Type filter
        if (typeFilter) {
            filtered = filtered.filter((block) => block.Type === typeFilter);
        }

        // Source filter
        if (sourceFilter) {
            filtered = filtered.filter((block) => block.Source === sourceFilter);
        }

        // CR range filter
        if (crMinFilter !== null) {
            filtered = filtered.filter((block) => block.ChallengeRating >= crMinFilter);
        }
        if (crMaxFilter !== null) {
            filtered = filtered.filter((block) => block.ChallengeRating <= crMaxFilter);
        }

        setFilteredBlocks(filtered);
    }, [statBlocks, searchQuery, typeFilter, sourceFilter, crMinFilter, crMaxFilter]);

    // Load stat blocks
    React.useEffect(() => {
        loadStatBlocks();
    }, [loadStatBlocks]);

    // Filter stat blocks when search or filters change
    React.useEffect(() => {
        filterStatBlocks();
    }, [filterStatBlocks]);

    const onPageChange = (event: PaginatorPageChangeEvent) => {
        setCurrentPage(event.page + 1);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setTypeFilter(null);
        setSourceFilter(null);
        setCrMinFilter(null);
        setCrMaxFilter(null);
    };

    // Get unique values for filter dropdowns
    const uniqueTypes = [...new Set(statBlocks.map((b) => b.Type))].sort();
    const uniqueSources = [...new Set(statBlocks.map((b) => b.Source))].sort();

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{filter === "custom" ? "Custom" : "Official"} Stat Blocks</h2>
                        <p className="text-base text-gray-600 dark:text-gray-400 mt-1">{loading ? "Loading..." : `${filteredBlocks.length} stat blocks`}</p>
                    </div>
                    {/*to="/library/statblocks/new"*/}
                    <Link to=".">
                        <button className="px-6 py-3 text-base bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2">
                            <i className="pi pi-plus"></i>
                            Create New
                        </button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <span className="p-input-icon-left flex-1 min-w-[200px]">
                        <i className="pi pi-search text-lg" />
                        <InputText value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name..." className="w-full text-base" />
                    </span>

                    <Dropdown value={typeFilter} onChange={(e) => setTypeFilter(e.value)} options={uniqueTypes} placeholder="Filter by Type" showClear className="min-w-[150px] text-base" />

                    <Dropdown value={sourceFilter} onChange={(e) => setSourceFilter(e.value)} options={uniqueSources} placeholder="Filter by Source" showClear className="min-w-[150px] text-base" />

                    <div className="flex items-center gap-2">
                        <InputText type="number" value={crMinFilter?.toString() ?? ""} onChange={(e) => setCrMinFilter(e.target.value ? Number(e.target.value) : null)} placeholder="Min CR" className="w-24 text-base" />
                        <span className="text-gray-600 dark:text-gray-400">-</span>
                        <InputText type="number" value={crMaxFilter?.toString() ?? ""} onChange={(e) => setCrMaxFilter(e.target.value ? Number(e.target.value) : null)} placeholder="Max CR" className="w-24 text-base" />
                    </div>

                    {(searchQuery || typeFilter || sourceFilter || crMinFilter !== null || crMaxFilter !== null) && (
                        <button onClick={clearFilters} className="px-4 py-2 text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(10)].map((_, i) => (
                            <SkeletonRow key={i} />
                        ))}
                    </div>
                ) : filteredBlocks.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <i className="pi pi-inbox text-6xl mb-4 text-gray-400 dark:text-gray-600"></i>
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No Stat Blocks Found</h3>
                            <p className="text-base text-gray-600 dark:text-gray-400">{searchQuery || typeFilter || sourceFilter || crMinFilter || crMaxFilter !== null ? "Try adjusting your filters" : "Create your first stat block to get started"}</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredBlocks.map((block) => (
                            <StatBlockRow key={block.ID} block={block} />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && filteredBlocks.length > 0 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <Paginator first={(currentPage - 1) * PAGE_SIZE} rows={PAGE_SIZE} totalRecords={filteredBlocks.length} onPageChange={onPageChange} />
                </div>
            )}
        </div>
    );
}

function StatBlockRow({ block }: { block: EntityOverview }) {
    return (
        // to={`/library/statblocks/${block.ID}`}
        <Link to=".">
            <div className="p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{block.Name}</h3>
                            <span className="px-3 py-1 text-sm font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">CR {block.ChallengeRating}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-base text-gray-600 dark:text-gray-400">
                            <span>
                                <strong>Type:</strong> {block.Type}
                            </span>
                            <span>
                                <strong>Size:</strong> {block.Size}
                            </span>
                            <span>
                                <strong>Source:</strong> {block.Source}
                            </span>
                        </div>
                    </div>
                    <i className="pi pi-chevron-right text-xl text-gray-400"></i>
                </div>
            </div>
        </Link>
    );
}

function SkeletonRow() {
    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <Skeleton width="200px" height="1.5rem" />
                        <Skeleton width="60px" height="1.5rem" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton width="120px" height="1rem" />
                        <Skeleton width="100px" height="1rem" />
                        <Skeleton width="140px" height="1rem" />
                    </div>
                </div>
            </div>
        </div>
    );
}
