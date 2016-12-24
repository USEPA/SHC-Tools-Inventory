import csv
csv_file = 'DPL-concepts-by-objectives.csv'
with open(csv_file, newline='') as csvfile:
    spamreader = csv.reader(csvfile)
    objectives = concepts1 = concepts2 = []
    concepts_by_objective = {}
    for row in spamreader:
        objective = row[0]
        concept1 = row[1]
        concept2 = row[2]
        if objective.strip() != '':
            if objective not in concepts_by_objective.keys():
                concepts_by_objective[objective] = []
            if concept1 not in concepts_by_objective[objective]\
                    and concept1.strip() != '':
                concepts_by_objective[objective].append(concept1)
            if concept2 not in concepts_by_objective[objective]\
                    and concept2.strip() != '':
                concepts_by_objective[objective].append(concept2)
print(concepts_by_objective)
