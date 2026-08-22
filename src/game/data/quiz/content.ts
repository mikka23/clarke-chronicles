// All spoken/written copy for the quiz scenes, gathered in one place so it's
// easy to proofread, edit, and record narration audio against. Each quiz
// data file (amber1.ts, omelette.ts, etc.) imports its strings from here
// instead of hardcoding them - the gameplay data (keys, correct answers,
// points) stays in those files.

export const QUIZ_TEXT = {
    amber1: {
        narrationBody: "Speaking of hunger, identify the dog.",
        choices: { amber: 'Amber', floss: 'Floss' }
    },

    amber2: {
        narrationBody: "Speaking of hunger, identify the dog.",
        choices: { amber: 'Amber', floss: 'Floss' }
    },

    animals: {
        narrationTitle: "NAME THE ANIMAL",
        narrationBody: "Name the animal."
    },

    cakes: {
        narrationTitle: "ON TO DESSERT",
        narrationBody: "Time for pudding. Over the years Mum has designed "
            + "a fair few birthday cakes - see if you can pick out the ones she's actually made.",
        question: "Which of these cakes has Mum designed over the years?",
        choices: {
            nfl: 'NFL',
            subbuteo: 'Subbuteo',
            'henrys-cat': "Henry's Cat",
            train: 'Train',
            wwf: 'WWF',
            sun: 'Sun',
            turtle: 'Turtle',
            'he-man': 'He-Man',
            moomins: 'Moomins',
            rugrats: 'Rugrats',
            tractor: 'Tractor',
            dumbo: 'Dumbo'
        }
    },

    cousinRace: {
        narrationTitle: "RACE YOU TO THE END!",
        narrationBody: "Which cousin used to run beside the car until the end of the street?"
    },

    findTheCar: {
        narrationTitle: "TIME TO GO HOME",
        narrationBody: "Time to stop the traveling and go back home. "
            + "You need to help find the car.",
        pickInstruction: (maxPicks: number) => `Pick ${maxPicks} plates, then confirm.`
    },

    floss: {
        narrationBody: "Speaking of hunger, watch the video and identify the dog.",
        choices: { amber: 'Amber', floss: 'Floss' }
    },

    floss2: {
        narrationBody: "Speaking of hunger, identify the dog.",
        choices: { amber: 'Amber', floss: 'Floss' }
    },

    france: {
        narrationTitle: "ONE MORE PHOTO",
        narrationBody: "Another trip abroad. Name the country."
    },

    greyMaresTail: {
        narrationTitle: "LOCKED OUT",
        narrationBody: "Ben's just decided to leave the car and lock it "
            + "behind him. You're stuck outside in the rain, sheltering under the "
            + "bridge. Name the location."
    },

    jamils: {
        narrationTitle: "A TASTE OF THE PAST",
        narrationBody: "Time for something to eat - let's take a step back "
            + "in time for a nice curry at Jamil's. You order:\n\n"
            + "1 x Beef Curry\n"
            + "1 x Plain Rice\n"
            + "1 x Prawn Biryani\n"
            + "1 x Mango Chutney\n"
            + "1 x Chapati\n"
            + "Cover Charge (2 people)\n\n"
            + "How much does it cost?"
    },

    mull: {
        narrationTitle: "ONE MORE PHOTO",
        narrationBody: "A trip out to one of the islands. Name the "
            + "island this was taken on."
    },

    newForest: {
        narrationTitle: "ANOTHER PHOTO",
        narrationBody: "Trees for miles and a few familiar faces "
            + "wandering through them. Name the location."
    },

    omelette: {
        narrationTitle: "BONFIRE NIGHT OMELETTE",
        question: "It is bonfire day and Dad has just cooked an omelette, "
            + "but Michael is refusing to eat it, why?",
        choices: {
            'baked-potato': 'He wants to eat a baked potato at the fireworks',
            'smell-of-eggs': "He can't stand the smell of eggs",
            mouse: 'He thinks there is a mouse in it',
            'too-many-crisps': "He's already eaten too many crisps"
        }
    },

    paulCartoon: {
        narrationTitle: "THAT STUFF WILL KILL YOU",
        narrationBody: "Dad once ordered a vodka, only to be told "
            + "that stuff will kill you. Who said it?"
    },

    plum: {
        narrationTitle: "WHO IS THIS?",
        question: "Who is the person in the photo?",
        hints: {
            secondAttempt: "He was often seen walking around Pencaitland",
            thirdAttempt: "He shares his name with a fruit"
        }
    },

    scene1: {
        questions: {
            holeInOne: 'Select the members of the family who have had a hole in one.',
            snappedClub: 'Select the member of the family who has snapped a club in a fit of rage.',
            struckInThroat: 'Select the member of the family who struck Michael in the throat with a vicious swing of the club.',
            dontLetHimDrive: 'Who was the subject of the demand "Don\'t let him drive that"?',
            buggyInBunker: 'Who has driven a buggy into a bunker at Whitekirk?'
        },
        characterLabels: {
            michael: 'Michael',
            ben: 'Ben',
            dominic: 'Dominic',
            mum: 'Mum',
            dad: 'Dad'
        }
    },

    scene2: {
        narrationTitle: "NEXT STOP: BUTLINS",
        narrationBody: "You're off on a family trip to Butlins! Before "
            + "anyone can hit the road, the essential shopping needs doing so the "
            + "car's packed with everything the trip actually needs.",
        choices: {
            bikers: 'Bikers',
            brannigans: 'Brannigans',
            chipsticks: 'Chipsticks',
            discos: 'Discos',
            'salt-and-shake': 'Salt & Shake',
            'nik-naks': 'Nik Naks',
            'choc-dips': 'Choc Dips',
            hobnobs: 'Hobnobs',
            mars: 'Mars',
            fruit: 'Fruit',
            'fruit-salads': 'Fruit Salads',
            'chocolate-digestives': 'Choc Digestives',
            coke: 'Coke',
            'cola-cubes': 'Cola Cubes',
            'irn-bru': 'Irn Bru',
            'space-raiders': 'Space Raiders',
            vegetables: 'Vegetables',
            wham: 'Wham'
        }
    },

    scene3: {
        narrationTitle: "SETTLING IN",
        narrationBody: "You have settled in at Butlins, you have the "
            + "Irn Bru in the bath tub. What would you like to do today?",
        choices: {
            chairlift: 'Chairlift',
            'haunted-house': 'Haunted House',
            'bumper-boats': 'Bumper Boats',
            football: 'Football',
            simulator: 'Simulator',
            'arabian-derby': 'Arabian Derby',
            swimming: 'Swimming',
            cinema: 'Cinema'
        },
        feedback: {
            brokenAttraction: "It's broken!"
        }
    },

    skye: {
        narrationTitle: "ONE MORE PHOTO",
        narrationBody: "Another one of the islands. Name the "
            + "island this was taken on."
    },

    spain: {
        narrationTitle: "ANOTHER PHOTO",
        narrationBody: "Sunnier than back home, this one. Name the "
            + "country."
    },

    winnyAndIveys: {
        narrationTitle: "AN OLD PHOTO",
        narrationBody: "Tucked in behind everything else, a faded photo "
            + "turns up of two familiar faces outside somewhere you haven't thought "
            + "about in years. Name the location."
    }
};
