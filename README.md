# EncounterManager

Custom Encounter Manager for D&D 5E.

## To Do

- Entity Display Spells Control
- Add file upload to contact form
- Create players within campaign
- Design
    - Encounter runtime page
        - replace right-side controls with runtime controls
            - "Manage Initiative"
- Changing initiative should not be allowed in encounter view mode (allowed in edit or run mode)
- Library
    - Edit lairs
- Add Environment?
    - Basically lair but tied to encounter rather than an entity
- Changing which campaign an encounter is in should remove the players?
- Rework to use PrimeReact
- Active encounter page not correctly loading Started/Round/Turn metadata

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
