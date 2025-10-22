import * as React from "react";
import { createLazyFileRoute, Link, useRouteContext } from "@tanstack/react-router";
import Session from "supertokens-auth-react/recipe/session";
import { Card } from "primereact/card";
import { Button } from "primereact/button";

export const Route = createLazyFileRoute("/")({
    component: Index,
});

function Index() {
    const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
    const [authChecked, setAuthChecked] = React.useState<boolean>(false);

    React.useEffect(() => {
        Session.doesSessionExist().then((exists) => {
            setIsAuthenticated(exists);
            setAuthChecked(true);
        });
    }, []);

    // Show landing page immediately, then switch to dashboard if authenticated
    // This prevents the whole page from being blocked while context loads
    if (!authChecked) {
        return <LandingPage />;
    }

    return isAuthenticated ? <Dashboard /> : <LandingPage />;
}

// Landing page for logged-out users
function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-primary-950" style={{ fontSize: "16px" }}>
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-700 to-primary-900 dark:from-primary-700 dark:to-primary-900 text-white py-20">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <i className="pi pi-compass text-6xl text-accent-400"></i>
                    </div>
                    <h1 className="text-5xl font-bold mb-4">Welcome to Olorin</h1>
                    <p className="text-xl mb-8 text-primary-300">Your all-in-one TTRPG campaign management companion</p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => (window.location.href = "/auth")} className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-primary-900 border border-accent-500 rounded-md px-6 py-3 text-lg font-semibold transition-colors">
                            <i className="pi pi-sign-in"></i>
                            <span>Get Started</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Everything you need to run amazing campaigns</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <Card key="feature-campaigns" className="bg-white dark:bg-primary-900 border border-gray-200 dark:border-primary-800">
                        <div className="text-center">
                            <div className="mb-4">
                                <i className="pi pi-map text-5xl text-accent-500 dark:text-accent-400"></i>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Manage Campaigns</h3>
                            <p className="text-base text-gray-600 dark:text-primary-300">Organize your campaigns, track sessions, and keep all your adventure notes in one place.</p>
                        </div>
                    </Card>

                    {/* Feature 2 */}
                    <Card key="feature-encounters" className="bg-white dark:bg-primary-900 border border-gray-200 dark:border-primary-800">
                        <div className="text-center">
                            <div className="mb-4">
                                <i className="pi pi-shield text-5xl text-accent-500 dark:text-accent-400"></i>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Run Encounters</h3>
                            <p className="text-base text-gray-600 dark:text-primary-300">Track initiative, manage combat, and keep your encounters flowing smoothly.</p>
                        </div>
                    </Card>

                    {/* Feature 3 */}
                    <Card key="feature-library" className="bg-white dark:bg-primary-900 border border-gray-200 dark:border-primary-800">
                        <div className="text-center">
                            <div className="mb-4">
                                <i className="pi pi-book text-5xl text-accent-500 dark:text-accent-400"></i>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Build Your Library</h3>
                            <p className="text-base text-gray-600 dark:text-primary-300">Create custom stat blocks, manage characters, and organize all your campaign resources.</p>
                        </div>
                    </Card>
                </div>

                {/* CTA Section */}
                <div className="text-center mt-16">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Ready to start your adventure?</h3>
                    <button onClick={() => (window.location.href = "/auth")} className="inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white border border-accent-600 rounded-md px-8 py-3 text-lg font-semibold transition-colors">
                        <span>Sign In Now</span>
                        <i className="pi pi-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Dashboard for logged-in users
function Dashboard() {
    const context = useRouteContext({ from: "__root__" });
    const [campaigns, setCampaigns] = React.useState<any[]>([]);
    const [stats, setStats] = React.useState({
        campaigns: 0,
        encounters: 0,
        statBlocks: 0,
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Load campaigns from context
                setCampaigns(context.campaigns || []);

                // TODO: Fetch actual stats from API
                // For now, using placeholder data
                setStats({
                    campaigns: context.campaigns?.length || 0,
                    encounters: 0, // TODO: Add API call
                    statBlocks: 0, // TODO: Add API call
                });
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (context.loaded) {
            loadDashboardData();
        }
    }, [context.loaded, context.campaigns]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8" style={{ fontSize: "16px" }}>
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your campaigns.</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card key="stat-campaigns" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-100 dark:bg-primary-800 rounded-lg">
                                <i className="pi pi-map text-3xl text-primary-600 dark:text-primary-300"></i>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Campaigns</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.campaigns}</p>
                            </div>
                        </div>
                    </Card>

                    <Card key="stat-encounters" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-200 dark:bg-primary-700 rounded-lg">
                                <i className="pi pi-shield text-3xl text-primary-700 dark:text-primary-200"></i>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Encounters</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.encounters}</p>
                            </div>
                        </div>
                    </Card>

                    <Card key="stat-statblocks" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-200 dark:bg-primary-700 rounded-lg">
                                <i className="pi pi-book text-3xl text-primary-700 dark:text-primary-200"></i>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Custom Stat Blocks</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.statBlocks}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Recent Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Recent Campaigns */}
                        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Recent Campaigns</h2>
                                <Link to="/campaigns">
                                    <Button label="View All" icon="pi pi-arrow-right" iconPos="right" className="p-button-text text-accent-600 dark:text-accent-400" />
                                </Link>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <i className="pi pi-spin pi-spinner text-4xl text-gray-400 dark:text-gray-600"></i>
                                </div>
                            ) : campaigns.length === 0 ? (
                                <div className="text-center py-8">
                                    <i className="pi pi-map text-5xl text-gray-400 dark:text-gray-600 mb-4"></i>
                                    <p className="text-base text-gray-600 dark:text-gray-400 mb-4">You don't have any campaigns yet</p>
                                    <Link to="/campaigns">
                                        <Button label="Create Your First Campaign" icon="pi pi-plus" className="bg-accent-600 hover:bg-accent-700 text-white border-accent-600" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {campaigns.slice(0, 5).map((campaign, i) => (
                                        <div key={i} onClick={() => (window.location.href = `/campaigns/${campaign.ID}`)} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors cursor-pointer">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.Name}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{campaign.PlayerCount} players</p>
                                                </div>
                                                <i className="pi pi-chevron-right text-gray-400"></i>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar - Quick Actions */}
                    <div className="space-y-6">
                        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <Link key="action-campaigns" to="/campaigns">
                                    <button className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-left">
                                        <i className="pi pi-plus-circle text-xl text-accent-500 dark:text-accent-400"></i>
                                        <span className="text-base font-medium text-gray-900 dark:text-white">New Campaign</span>
                                    </button>
                                </Link>
                                <Link key="action-encounters" to="/encounters">
                                    <button className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-left">
                                        <i className="pi pi-shield text-xl text-accent-500 dark:text-accent-400"></i>
                                        <span className="text-base font-medium text-gray-900 dark:text-white">Start Encounter</span>
                                    </button>
                                </Link>
                                <Link key="action-statblocks" to="/library/custom-statblocks">
                                    <button className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-left">
                                        <i className="pi pi-file-edit text-xl text-accent-500 dark:text-accent-400"></i>
                                        <span className="text-base font-medium text-gray-900 dark:text-white">Add Stat Block</span>
                                    </button>
                                </Link>
                                <Link key="action-library" to="/library">
                                    <button className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-left">
                                        <i className="pi pi-book text-xl text-accent-500 dark:text-accent-400"></i>
                                        <span className="text-base font-medium text-gray-900 dark:text-white">Browse Library</span>
                                    </button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
