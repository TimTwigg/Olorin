# EncounterManager

Custom Encounter Manager for D&D 5E.

## To Do

- Entity Display Spells Control
- Contact page - referenced in error component
- entity table not populated on encounter creation
- Use user email/display name instead of user id in optionBox
- Profile page - linked from optionBox

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
