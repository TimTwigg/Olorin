# EncounterManager

Custom Encounter Manager for D&D 5E.

## To Do

- Entity Display Spells Control
- Add file upload to contact form
- Campaigns page
    - Create and manage campaigns
- Create/manage players within campaign
- Add players from linked campaign into encounter
    - Multicheckbox style
- Fix scuffed CSS on encounter page

## Ideas

- Extra stat blocks (ie for wildshape) could be added via a button in the settings sub options.
    - Could be a "switch to secondary stat block" method, or a "add a secondary block" method (the latter then also requiring the ability to switch between stat blocks)
    - Behavior relating to hit points depends on the precise mechanic - would need to be defined
        - Could be a secondary button/interface.
        - Wildshape would act in a certain way
        - Default behavior for other uses
            - What other use cases are there?
- Make which saving throws are on entity overview customizable

## Long Term

- Reduce frequency of saves to server (for performance / network)?
    - Already minimized save on encounter changes. Could batch changes and only save once per minute?
