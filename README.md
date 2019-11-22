# SHC-Tools-Inventory

## Introduction

This tool helps users find software that promote sustainability.
Users of the wizard answer questions about a scenario to find relevant software tools.
Once results are found, users can review or print the details of user-selected softwares.

## Usage

### Wizard

1. Select one or more answers to each question from the choices shown.
1. Use the button labeled "Next" or use the next tab to advance to the next question.
1. Answers to any question may be changed at any time.
  - Selecting new answers creates new choices for answers to later questions.
  - Deselecting answers removes choices for answers to later questions.
1. Use the find tools button after all questions have been answered to see relevant tools.
1. Click the description of a tool to see its details.

## Contributing

Please follow this project's documented code-conventions when contributing in order to maintain consistency.
A python module to aid development is at `dev/devtool.py`.
This tool can be used to list important details for each tool in the inventory.
The following example demonstrates retrieving details for each tool and checking the HTTP-status-code for each tool's URL and sending the data to a csv.

```
$ cd dev/
$ python
>>> import devtool
>>> dt = devtool.Devtool()
>>> checked_links = dt.check_link_for_all_ids()
>>> dt.send_to_csv(checked_links, filename.csv)
```

## Installation

Installation is getting the documents and a web-browser.

Notes about project:

To launch the project locally after you download the repo you can use the command line to run “python -m http.server” which will then allow you to run the pages on, for example http://localhost:8000/. It will tell you what port it runs on, but you can also specify a port if you want. There’s also an extension called “Live Server” for Visual Studio Code that is handy for this. 

When moving the code to Drupal you only need the main main content of the page since Drupal will insert that into their template for an EPA page. I always disable rich-text on the editor to get the plain HTML, not the WYSIWYG interface. Below the editor there’s a Page Javascript section where you can either insert CSS or Javascript directly in `<style>` or `<script`> tags or link to the files. This is where you link the JS libraries or CSS files.

### Requirements

This project requires a web-browser with javascript enabled.
If the browser is Internet Explorer then it must be version 10 or greater to function completely.

### Installation

Install this tool by running `git clone https://www.github.com/USEPA/shc-tools-inventory.git`.

### Configuration

No configuration is required.

## Credits

Allen Brookes, Seth Jenkins, Marilyn Tenbrink, Ingrid Heilke, Julia Twitchell, Ryan Furey, and Kyle Thomas.

## License

This tool uses jQuery. jQuery's license is noted.  

## EPA Disclaimer

The United States Environmental Protection Agency (EPA) GitHub project code is provided on an "as is" basis and the user assumes responsibility for its use. EPA has relinquished control of the information and no longer has responsibility to protect the integrity, confidentiality, or availability of the information. Any reference to specific commercial products, processes, or services by service mark, trademark, manufacturer, or otherwise, does not constitute or imply their endorsement, recommendation or favoring by EPA. The EPA seal and logo shall not be used in any manner to imply endorsement of any commercial product or activity by EPA or the United States Government.
