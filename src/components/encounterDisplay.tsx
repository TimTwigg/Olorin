import { Encounter } from "@src/models/encounter"

type EncounterDisplayProps = {
    encounter: Encounter;
}

export function EncounterDisplay({ encounter }: EncounterDisplayProps) {
    return (
        <div className="encounterDisplay">
            <h4>{encounter.Name}</h4>
        </div>
    );
}