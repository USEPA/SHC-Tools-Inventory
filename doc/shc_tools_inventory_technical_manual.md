# SHC Tools-Inventory: a Technical Manual

- The SHC Tools-Inventory is a set of web-applications which function through javascript using the Registry of EPA's Applications and Data-warehouses(READ)'s Web-Services to help users find relevant tools.

- SHC's Tools-Inventory is built upon [READ's Web-Services](https://ofmpub.epa.gov/readwebservices/).

- Sets of tools such as search results, browsed tools, and saved tools may be toggled between a textual format and a tabular format at any time.

- The button labeled "export selected tools to CSV" saves details for each selected tool as a row of a comma-separated values file.

- The button labeled "select all tools" will select all tools within the section.

- The button labeled "deselect all tools" will deselect all selected tools within the section.

- When results are found there will be a tab labeled "results" alongside those for search, advanced search, and browse tools.

- After a tool is selected there will be a tab labeled "selected tool" that holds the most recently selected tool's details. This tab will be displayed alongside those for search, advanced search, and browse tools.

- Lists of tools may be shown in either a textual format or a tabular format.

  - Textual Format

    - Select this format by selecting the radio-button labeled "text: recommended for those on smaller screens."

    - Each tool has a button labeled "show tool details" to view the details in the tab labeled "selected tool."

    - Each tool has a checkbox to select the tool for saving or exporting.

  - Tabular Format

    - Select this format by selecting the radio-button labeled "table: allows filtering and column sorting."

    - Displayed tools may be filtered to show only those whose details contain the query entered in the search box.

    - Using a column-header as a button will sort tools in the table by the values in that column.

    - Clicking a row displays that tool's details in the tab labeled "selected tool."

- Large sections have a link at their bottom to "return to top of section."

## index.html

- This page provides a description of each tool.

- Links are supplied to each tool.

- Links are supplied to other tools which support decisions related to sustainability.

## search.html

- This page contains search, advanced search, and browse tools.

### Search

- Search case-insensitively matches a substring within the

  - acronym-field,

  - name-field,

  - short-description-field, or 

  - keywords-field
of READ.

### Advanced Search

- Users can select which fields of READ to search for the substring entered in the search-query-text-field with optional constraints specified.

- Fields that may be searched are

  - title(this is the "name"-field),

  - acronym,

  - short description,
  
  - keywords,

  - model-inputs, and

  - output-variables.

- Constraints are imposed by selections.

  - Decision-sectors are constrained to those selected from amongst

    - building and infrastructure,

    - land-use,

    - transportation, and

    - waste-management.

  - Operating-environments are constrained to those selected from amongst

    - desktop,

    - browser, and

    - mobile.

  - Cost-ranges are constrained to those selected from amongst

    - free,

    - $1-$499,

    - $500-$1499,

    - $1500-$3999, and

    - greater than $4000.

  - Spatial extents are constrained to those selected from amongst

    - building,

    - site,

    - neighborhood,

    - city,

    - county,

    - state,

    - nation,

    - continent, and

    - globe.

- All selections are cleared by using the button labeled "reset form."

### Browse Tools

- A decision-sector is selected from among

  - building and infrastructure,

  - land-use,

  - transportation, or

  - waste-management.

### Results

- The tab labeled "results" shows the results returned from the most recent search or advanced search.

### Saved Results

- Results remain saved during repeated searches, browsing, and changes between tabular and textual formats.

- If settings permit the app to use local storage then saved results will be saved during navigation away from the app.

### Selected Tool

- The tab labeled "selected tool" displays the details of the most recently selected tool.

## wizard.html

- The SHC's Tools-Inventory-Wizard asks questions about a scenario to locate relevant tools for that scenario.

- Wizard uses a database called Decision-Path-Library(DPL) to populate possible responses to future questions according to previous questions' responses.

- Use wizard:

  1. choose roles from those provided by DPL,

  2. choose subroles that DPL associates with the selected roles,

  3. choose fundamental objectives from those DPL associates with selected subroles,

  4. choose objectives from those DPL associates with selected subroles and fundamental objectives,

  5. choose concepts from those DPL associates with selected objectives,

  6. peruse tools, and

  7. choose tools to export their details to a CSV-file, print the details, or collect the details together with other tools' details while searching or browsing.
  
    - Local storage is required to share tools' details amongst wizard, search, and browse.

- Help icons that look like an "i" in a black-filled circle display additional information about the current step.

### Roles

- Buttons are provided to "select all roles" or "deselect all roles."

- Select all roles that apply in the scenario for which tools are desired.

- Use the button labeled "next" to proceed.

### Subroles

- Use any tab as a button to review or change the selections made there.

- Select all applicable subroles.

- Buttons are provided to "select all subroles" or "deselect all subroles."

- Use the button labeled "back" to review or change previous selections.

- Use the button labeled "next" to proceed.

### Fundamental Objectives

- Use any tab as a button to review or change the selections made there.

- Buttons are provided to "select all fundamental objectives" or "deselect all fundamental objectives."

- Select all fundamental objectives that apply in the scenario for which tools are desired.

- Use the button labeled "back" to review or change previous selections.

- Use the button labeled "next" to proceed.

### Objectives

- Use any tab as a button to review or change the selections made there.

- Buttons are provided to "select all objectives" or "deselect all objectives."

- Objectives are displayed grouped under their associated fundamental objectives.

  - Buttons are provided to "select all" or "deselect all" objectives in each group.

- Select all objectives that apply in the scenario for which tools are desired.

- Use the button labeled "back" to review or change previous selections.

- Use the button labeled "next" to proceed.

### Concepts

- Use any tab as a button to review or change the selections made there.

- Buttons are provided to "select all concepts" or "deselect all concepts."

- Each concept displays how many results would be added or removed with that concept's respective selection or deselection.

- The button labeled "add additional concepts" will add concepts associated with those already selected.

- Select all concepts that apply in the scenario for which tools are desired.

- Use the button labeled "back" to review or change previous selections.

- Use the button labeled "show x results" to display the list of tools located for this scenario where x is the number of results.
