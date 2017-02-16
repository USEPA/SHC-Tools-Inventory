# TODO

- PRIORITY 
  - find all records in READ that list "Allen Brookes" in the "Contact_Person" column of the database
    - option 1: ask Michael Pendleton how to gain a list of the records
    - option 2: search with ajax as follows
      - make a copy of the function simpleSearchClk3 called fetcher
      - build a javascript array of each record-ID in READ by searching for name = " "
        - var resourceSearchURL = "https://ofmpub.epa.gov/readwebservices/v1/ResourceAdvancedSearch";
      - pass each record id to detailSearchUrl
        - var resourceDetailURL = "https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail";
				- create ajax request to this url:
					


- "species ecosyst" and other text cut short in view

- titles of tools in browse -> hotlinks that populate descriptions

  - describe the categories (1.Buildings...2.Land Use3.Transportation4.Waste...) and why they were chosen

- disclaimers of endorsement of products and vendors by the EPA

- (Valerie:)no indication to user of no results for search when no results are found

- clicking a tool does nothing in some areas

- records like WARM contain too many undefined acronyms

- address why particular vendors were chosen and what the QA measures involved were

- EPA's General Counsel might need to determine if EPA can choose some vendor over another

- "have no data provided" under organizational tab of Nature Serve Vista; many other records incomplete

- Allen is listed as POC for numerous projects

- how will data be updated to keep tool current?

- when and by whom will data in the tool be reviewed at NHEERL? 

# email source of TODO-items
Valerie:
----------------------------
From: Brandon, Valerie 
Sent: Tuesday, July 19, 2016 11:45 AM
To: Kapuscinski, Jacques <Kapuscinski.Jacques@epa.gov>
Subject: Comments on SHC Tools Inventory search page
Jacques—
Here are a few comments based on the SHC search page. 
•LOW The search functionality (specifically the rendering of search results) doesn’t seem to work completely in IE.  I believe there is an IE setting that may need to be modified to address this.  I’ll be scheduling a meeting with Andrew Yuen to talk more about this.
•HIGH There doesn’t appear to be any indication (obvious to the user) when there are no results that meet the search criteria (this may be related to the issue above).
•LOW  Some footer/header links in template may need to be adjusted/modified when the search page files are moved into a staging environment.
•LOW Haven’t confirmed 508 compliance.
Jacques:
-----------------------------
??? Under browse tools the titles of the tools need to be hot links. It would be helpful to have those links that are non EPA to be hot links. They also  need to have exit EPA disclaimers.
I am curious why you choose not to make those hotlinks.
HIGH It would help to have a pop up window or a link to each of these categories so readers and can have some context to what these four categories are and why they were selected.
1. Buildings and Related Infrastructure 2. Land Use 3. Transportation 4. Waste Disposal
HIGH There are typos,  some of the forms have fields that say “now “data it should be “no” data
??? In some areas when I click on to select a tool nothing works.
??? Records like the WARM one are full of acronyms.
DISCARD??? There are larger policy issues, why are we selecting one vendor over another what was the QA protocol for deciding which tools to list.
DISCARD??? Can we select certain vendors over others, we will need to check with EPA’s General Council about this. There needs to be disclaimers saying EPA does not endorse these tools.
??? Many of the records are incomplete like see Nature Serve Vista below. Why is the organizational tab “have no data provided” when it is the Natur Serv that owns that app?. I have attached a screen shot with an example.
DISCARD???  Why are you listed as the POC for non EPA tools. Are you going to field questions for all of these tools? This is not clear to me. I have attached another screen shot at the bottom showing the examples.
LOW??? There are sentences where the words are not spelled out all the way, see last screen species ecosyst . That could be a function of the zip file and may work in browser form I am not sure.
??? How will the data actually be updated so the tool stays current?
??? Who and when will the SHC program be engaged to review the tool in addition to NHEERL from a data perspective ?

# DONE
------
- DONE scrape emails for TODO-items from Jacques and Valerie's points in the emails forwarded by Allen

- work through each TODO to determine how to address it and note the pathway in TODO under its TODO-item

- DONE HIGH It would help to have a pop up window or a link to each of these categories so readers and can have some context to what these four categories are and why they were selected.
1. Buildings and Related Infrastructure 2. Land Use 3. Transportation 4. Waste Disposal
  - I chose to use prettify and extend the table that already existed as a highly accessible, completely visible solution to describing these elements in place without pushing the search-form too far down the page 

- DONE HIGH There are typos,  some of the forms have fields that say “now “data it should be “no” data

- DONE HIGH There doesn’t appear to be any indication (obvious to the user) when there are no results that meet the search criteria (this may be related to the issue above).
