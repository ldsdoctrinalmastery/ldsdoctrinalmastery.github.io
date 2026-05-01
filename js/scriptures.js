// Doctrinal Mastery scriptures database - Using first 12 scriptures
const doctrinalMasteryScriptures = [
    {
        id: 1,
        reference: "Joseph Smith—History 1:15–20",
        content: "I saw a pillar of light exactly over my head, above the brightness of the sun, which descended gradually until it fell upon me... When the light rested upon me I saw two Personages, whose brightness and glory defy all description, standing above me in the air. One of them spake unto me, calling me by name and said, pointing to the other—This is My Beloved Son. Hear Him!",
        doctrines: ["The Godhead", "First Vision"],
        questions: [
            {
                type: "reference",
                question: "Which Doctrinal Mastery scripture contains Joseph Smith's account of seeing Heavenly Father and Jesus Christ?",
                answers: [
                    "Joseph Smith—History 1:15–20",
                    "D&C 76:22–24",
                    "D&C 130:22–23",
                    "D&C 135:3"
                ],
                correctAnswer: 0
            },
            {
                type: "content",
                question: "What did the first personage say to Joseph Smith during the First Vision?",
                answers: [
                    "This is my servant, hear him.",
                    "This is My Beloved Son. Hear Him!",
                    "Joseph, thy sins are forgiven thee.",
                    "I am the Lord thy God, fear not."
                ],
                correctAnswer: 1
            },
            {
                type: "doctrine",
                question: "Which doctrine is taught in Joseph Smith—History 1:15–20?",
                answers: [
                    "Word of Wisdom",
                    "Plan of Salvation",
                    "The Godhead",
                    "Priesthood Authority"
                ],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 2,
        reference: "D&C 1:30",
        content: "And also those to whom these commandments were given, might have power to lay the foundation of this church, and to bring it forth out of obscurity and out of darkness, the only true and living church upon the face of the whole earth, with which I, the Lord, am well pleased, speaking unto the church collectively and not individually.",
        doctrines: ["The Church of Jesus Christ", "Restoration"],
        questions: [
            {
                type: "reference",
                question: "Which scripture describes the Church as 'the only true and living church upon the face of the whole earth'?",
                answers: [
                    "D&C 1:30",
                    "D&C 1:37–38",
                    "D&C 6:36",
                    "D&C 21:4–6"
                ],
                correctAnswer: 0
            },
            {
                type: "content",
                question: "In D&C 1:30, the Lord says He is well pleased with:",
                answers: [
                    "Individual members of the Church",
                    "The Church collectively, not individually",
                    "The Prophet Joseph Smith",
                    "Those who keep His commandments"
                ],
                correctAnswer: 1
            },
            {
                type: "content",
                question: "According to D&C 1:30, the Lord brought forth His church out of:",
                answers: [
                    "Obscurity and darkness",
                    "Sin and transgression",
                    "Apostasy and confusion",
                    "Persecution and trials"
                ],
                correctAnswer: 0
            }
        ]
    },
    {
        id: 3,
        reference: "D&C 1:37–38",
        content: "Search these commandments, for they are true and faithful, and the prophecies and promises which are in them shall all be fulfilled. What I the Lord have spoken, I have spoken, and I excuse not myself; and though the heavens and the earth pass away, my word shall not pass away, but shall all be fulfilled, whether by mine own voice or by the voice of my servants, it is the same.",
        doctrines: ["Scripture Study", "Prophets"],
        questions: [
            {
                type: "reference",
                question: "Which Doctrinal Mastery scripture teaches that the Lord's word will not pass away?",
                answers: [
                    "D&C 1:30",
                    "D&C 1:37–38",
                    "D&C 6:36",
                    "D&C 8:2–3"
                ],
                correctAnswer: 1
            },
            {
                type: "content",
                question: "According to D&C 1:37–38, how does the Lord view the words spoken by His servants?",
                answers: [
                    "As suggestions that might be followed",
                    "As less important than His own words",
                    "As equal to His own voice",
                    "As necessary only for church leaders"
                ],
                correctAnswer: 2
            },
            {
                type: "content",
                question: "Fill in the blank: 'What I the Lord have spoken, I have spoken, and I _____ not myself.'",
                answers: [
                    "Excuse",
                    "Contradict",
                    "Deny",
                    "Change"
                ],
                correctAnswer: 0
            }
        ]
    },
    {
        id: 4,
        reference: "D&C 6:36",
        content: "Look unto me in every thought; doubt not, fear not.",
        doctrines: ["Faith", "Trust in God"],
        questions: [
            {
                type: "reference",
                question: "Which scripture contains the Lord's command to 'Look unto me in every thought; doubt not, fear not'?",
                answers: [
                    "D&C 1:37–38",
                    "D&C 6:36",
                    "D&C 8:2–3",
                    "D&C 18:10–11"
                ],
                correctAnswer: 1
            },
            {
                type: "content",
                question: "Fill in the missing words: 'Look unto me in every _____; _____ not, _____ not.'",
                answers: [
                    "thought; doubt; fear",
                    "trial; worry; stress",
                    "prayer; forget; fail",
                    "day; falter; fall"
                ],
                correctAnswer: 0
            },
            {
                type: "doctrine",
                question: "What principle does D&C 6:36 teach about overcoming fear?",
                answers: [
                    "Prayer alone will remove all fear",
                    "Looking to Christ in every thought helps us overcome doubt and fear",
                    "Scripture study is the only way to overcome fear",
                    "Working hard eliminates all doubt"
                ],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 5,
        reference: "D&C 8:2–3",
        content: "Yea, behold, I will tell you in your mind and in your heart, by the Holy Ghost, which shall come upon you and which shall dwell in your heart. Now, behold, this is the spirit of revelation; behold, this is the spirit by which Moses brought the children of Israel through the Red Sea on dry ground.",
        doctrines: ["Holy Ghost", "Revelation"],
        questions: [
            {
                type: "reference",
                question: "Which scripture teaches how the Holy Ghost communicates with us?",
                answers: [
                    "D&C 6:36",
                    "D&C 8:2–3",
                    "D&C 13:1",
                    "D&C 18:10–11"
                ],
                correctAnswer: 1
            },
            {
                type: "content",
                question: "According to D&C 8:2–3, where does the Holy Ghost speak to us?",
                answers: [
                    "In our ears and eyes",
                    "In our mind and heart",
                    "In our dreams and visions",
                    "In our homes and churches"
                ],
                correctAnswer: 1
            },
            {
                type: "content",
                question: "According to D&C 8:2–3, what spirit parted the Red Sea?",
                answers: [
                    "The spirit of power",
                    "The spirit of prophecy",
                    "The spirit of revelation",
                    "The spirit of miracles"
                ],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 6,
        reference: "D&C 13:1",
        content: "Upon you my fellow servants, in the name of Messiah I confer the Priesthood of Aaron, which holds the keys of the ministering of angels, and of the gospel of repentance, and of baptism by immersion for the remission of sins; and this shall never be taken again from the earth, until the sons of Levi do offer again an offering unto the Lord in righteousness.",
        doctrines: ["Priesthood", "Aaronic Priesthood"],
        questions: [
            {
                type: "reference",
                question: "Which scripture describes the restoration of the Aaronic Priesthood?",
                answers: [
                    "D&C 8:2–3",
                    "D&C 13:1",
                    "D&C 18:15–16",
                    "D&C 107:8"
                ],
                correctAnswer: 1
            },
            {
                type: "content",
                question: "According to D&C 13:1, what keys does the Aaronic Priesthood hold?",
                answers: [
                    "Keys of salvation and eternal life",
                    "Keys of the ministering of angels, the gospel of repentance, and baptism by immersion",
                    "Keys of the kingdom of heaven",
                    "Keys of revelation and prophecy"
                ],
                correctAnswer: 1
            },
            {
                type: "content",
                question: "Complete the scripture: 'Upon you my fellow servants, in the name of Messiah I confer...'",
                answers: [
                    "...the right to preach my gospel.",
                    "...the Priesthood of Aaron, which holds the keys of the ministering of angels.",
                    "...the power to heal the sick and raise the dead.",
                    "...the authority to speak in my name."
                ],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 7,
        reference: "D&C 18:10–11",
        content: "Remember the worth of souls is great in the sight of God; For, behold, the Lord your Redeemer suffered death in the flesh; wherefore he suffered the pain of all men, that all men might repent and come unto him.",
        doctrines: ["Worth of Souls", "Atonement"],
        questions: [
            {
                type: "reference",
                question: "Which scripture teaches about the worth of souls in God's sight?",
                answers: [
                    "D&C 13:1",
                    "D&C 18:10–11",
                    "D&C 18:15–16",
                    "D&C 19:16–19"
                ],
                correctAnswer: 1
            },
            {
                type: "content",
                question: "According to D&C 18:10–11, why did the Savior suffer death?",
                answers: [
                    "To establish His church",
                    "To fulfill prophecy",
                    "That all men might repent and come unto Him",
                    "To prove His power over death"
                ],
                correctAnswer: 2
            },
            {
                type: "content",
                question: "Fill in the blank: 'Remember the worth of souls is _____ in the sight of God.'",
                answers: [
                    "precious",
                    "great",
                    "eternal",
                    "important"
                ],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 8,
        reference: "D&C 18:15–16",
        content: "And if it so be that you should labor all your days in crying repentance unto this people, and bring, save it be one soul unto me, how great shall be your joy with him in the kingdom of my Father! And now, if your joy will be great with one soul that you have brought unto me into the kingdom of my Father, how great will be your joy if you should bring many souls unto me!",
        doctrines: ["Missionary Work", "Joy"],
        questions: [
            {
                type: "reference",
                question: "Which scripture discusses the joy of bringing souls unto Christ?",
                answers: [
                    "D&C 18:10–11",
                    "D&C 18:15–16",
                    "D&C 19:16–19",
                    "D&C 21:4–6"
                ],
                correctAnswer: 1
            },
            {
                type: "content",
                question: "According to D&C 18:15–16, how many souls need to be brought to Christ to experience great joy?",
                answers: [
                    "At least ten",
                    "As many as possible",
                    "Even one soul",
                    "Your entire family"
                ],
                correctAnswer: 2
            },
            {
                type: "doctrine",
                question: "What principle is taught in D&C 18:15–16?",
                answers: [
                    "Joy comes through serving in church callings",
                    "Joy comes through bringing souls unto Christ",
                    "Joy comes through temple attendance",
                    "Joy comes through scripture study"
                ],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 9,
        reference: "D&C 19:16–19",
        content: "For behold, I, God, have suffered these things for all, that they might not suffer if they would repent; But if they would not repent they must suffer even as I; Which suffering caused myself, even God, the greatest of all, to tremble because of pain, and to bleed at every pore, and to suffer both body and spirit—and would that I might not drink the bitter cup, and shrink—Nevertheless, glory be to the Father, and I partook and finished my preparations unto the children of men.",
        doctrines: ["Atonement", "Repentance"],
        questions: [
            {
                type: "reference",
                question: "Which scripture describes Christ's suffering during the Atonement?",
                answers: [
                    "D&C 18:15–16",
                    "D&C 19:16–19",
                    "D&C 21:4–6",
                    "D&C 25:13"
                ],
                correctAnswer: 1
            },
            {
                type: "content",
                question: "According to D&C 19:16–19, why did Christ suffer for all?",
                answers: [
                    "To prove His divinity",
                    "That they might not suffer if they would repent",
                    "To fulfill the law of Moses",
                    "Because His Father commanded Him"
                ],
                correctAnswer: 1
            },
            {
                type: "content",
                question: "According to D&C 19:16–19, what physical manifestation occurred during Christ's suffering?",
                answers: [
                    "He fell asleep from exhaustion",
                    "His clothes became white as light",
                    "He bled from every pore",
                    "He was lifted up from the earth"
                ],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 10,
        reference: "D&C 21:4–6",
        content: "Wherefore, meaning the church, thou shalt give heed unto all his words and commandments which he shall give unto you as he receiveth them, walking in all holiness before me; For his word ye shall receive, as if from mine own mouth, in all patience and faith. For by doing these things the gates of hell shall not prevail against you; yea, and the Lord God will disperse the powers of darkness from before you, and cause the heavens to shake for your good, and his name's glory.",
        doctrines: ["Prophets", "Revelation"],
        questions: [
            {
                type: "reference",
                question: "Which scripture teaches about following the prophet?",
                answers: [
                    "D&C 19:16–19",
                    "D&C 21:4–6",
                    "D&C 25:13",
                    "D&C 58:42–43"
                ],
                correctAnswer: 1
            },
            {
                type: "content",
                question: "According to D&C 21:4–6, how should we receive the prophet's words?",
                answers: [
                    "After careful consideration and personal revelation",
                    "As if from God's own mouth, in all patience and faith",
                    "With skepticism until proven true",
                    "Only if they align with our personal beliefs"
                ],
                correctAnswer: 1
            },
            {
                type: "doctrine",
                question: "What blessing comes from following the prophet according to D&C 21:4–6?",
                answers: [
                    "Financial prosperity and security",
                    "The gates of hell shall not prevail against you",
                    "Leadership positions in the Church",
                    "Freedom from all trials and tribulations"
                ],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 11,
        reference: "D&C 25:13",
        content: "Wherefore, lift up thy heart and rejoice, and cleave unto the covenants which thou hast made.",
        doctrines: ["Covenants", "Joy"],
        questions: [
            {
                type: "reference",
                question: "Which scripture commands us to 'cleave unto the covenants which thou hast made'?",
                answers: [
                    "D&C 21:4–6",
                    "D&C 25:13",
                    "D&C 58:42–43",
                    "D&C 76:22–24"
                ],
                correctAnswer: 1
            },
            {
                type: "content",
                question: "Fill in the blanks: 'Wherefore, _____ up thy heart and _____, and cleave unto the _____ which thou hast made.'",
                answers: [
                    "lift; rejoice; covenants",
                    "open; pray; commandments",
                    "give; sing; promises",
                    "hold; believe; teachings"
                ],
                correctAnswer: 0
            },
            {
                type: "doctrine",
                question: "What principle is taught in D&C 25:13?",
                answers: [
                    "We should be willing to share the gospel",
                    "We should seek for spiritual gifts",
                    "We should cleave to our covenants with joy",
                    "We should support our church leaders"
                ],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 12,
        reference: "D&C 58:42–43",
        content: "Behold, he who has repented of his sins, the same is forgiven, and I, the Lord, remember them no more. By this ye may know if a man repenteth of his sins—behold, he will confess them and forsake them.",
        doctrines: ["Repentance", "Forgiveness"],
        questions: [
            {
                type: "reference",
                question: "Which scripture teaches that the Lord remembers our sins no more when we repent?",
                answers: [
                    "D&C 25:13",
                    "D&C 58:42–43",
                    "D&C 76:22–24",
                    "D&C 82:10"
                ],
                correctAnswer: 1
            },
            {
                type: "content",
                question: "According to D&C 58:42–43, how can we know if someone has truly repented?",
                answers: [
                    "They will be baptized",
                    "They will confess and forsake their sins",
                    "They will serve a mission",
                    "They will attend church regularly"
                ],
                correctAnswer: 1
            },
            {
                type: "content",
                question: "According to D&C 58:42–43, what happens to our sins when we repent?",
                answers: [
                    "The Lord forgives them but still remembers them",
                    "The Lord forgives them and remembers them no more",
                    "The Lord forgives them but tests us again later",
                    "The Lord forgives them but others may still remember"
                ],
                correctAnswer: 1
            }
        ]
    }
];

// Function to add new questions to the doctrinalMasteryScriptures
function addNewQuestions() {
    // Add to JSH 1:15-20 (First Vision)
    doctrinalMasteryScriptures[0].questions.push(
        {
            type: "content",
            question: "In Joseph Smith—History 1:15–20, what did Joseph Smith feel immediately before seeing the light?",
            answers: [
                "He felt a sense of peace",
                "He was seized by some power which bound his tongue",
                "He felt uplifted by the Spirit",
                "He felt intense joy"
            ],
            correctAnswer: 1
        },
        {
            type: "content",
            question: "What prompted Joseph Smith to pray in the Sacred Grove?",
            answers: [
                "An angel appeared to him in a dream",
                "His family encouraged him to pray about which church to join",
                "He read James 1:5 which says to ask of God",
                "He was commanded by a voice"
            ],
            correctAnswer: 2
        },
        {
            type: "doctrine",
            question: "What important doctrine about God is clarified in Joseph Smith's First Vision?",
            answers: [
                "God doesn't answer personal prayers",
                "God and Jesus Christ are separate beings with physical bodies",
                "God no longer speaks to mankind",
                "God only speaks through the Bible"
            ],
            correctAnswer: 1
        }
    );

    // Add to D&C 1:30
    doctrinalMasteryScriptures[1].questions.push(
        {
            type: "content",
            question: "In D&C 1:30, how does the Lord describe His church?",
            answers: [
                "As the most powerful church on earth",
                "As the wealthiest church on earth",
                "As the only true and living church upon the earth",
                "As the church that will save all mankind"
            ],
            correctAnswer: 2
        },
        {
            type: "doctrine",
            question: "What distinguishes the Lord's Church according to D&C 1:30?",
            answers: [
                "Its size and influence",
                "Its charitable work",
                "Being 'true' (having correct doctrine) and 'living' (having revelation)",
                "Its ancient origins"
            ],
            correctAnswer: 2
        }
    );

    // Add to D&C 1:37-38
    doctrinalMasteryScriptures[2].questions.push(
        {
            type: "doctrine",
            question: "According to D&C 1:37-38, why should we study the commandments?",
            answers: [
                "Because they are difficult to understand",
                "Because they are true and faithful and will be fulfilled",
                "Because they are historically significant",
                "Because they contain hidden messages"
            ],
            correctAnswer: 1
        },
        {
            type: "content",
            question: "In D&C 1:37-38, what does the Lord say about His word passing away?",
            answers: [
                "His word shall not pass away",
                "His word will change with the times",
                "His word will eventually be replaced",
                "His word is only valid for a generation"
            ],
            correctAnswer: 0
        }
    );

    // Add to D&C 6:36
    doctrinalMasteryScriptures[3].questions.push(
        {
            type: "doctrine",
            question: "What principle does D&C 6:36 teach about our mindset?",
            answers: [
                "We should think about Christ occasionally",
                "We should doubt our abilities",
                "We should look to Christ in every thought",
                "We should fear future challenges"
            ],
            correctAnswer: 2
        },
        {
            type: "content",
            question: "What emotions does D&C 6:36 specifically tell us to avoid?",
            answers: [
                "Anger and jealousy",
                "Pride and vanity",
                "Doubt and fear",
                "Sadness and worry"
            ],
            correctAnswer: 2
        }
    );

    // Add to D&C 8:2-3
    doctrinalMasteryScriptures[4].questions.push(
        {
            type: "content",
            question: "According to D&C 8:2-3, where does the Holy Ghost speak to us?",
            answers: [
                "In our ears only",
                "In our mind and heart",
                "In our dreams only",
                "In church buildings only"
            ],
            correctAnswer: 1
        },
        {
            type: "content",
            question: "What Old Testament event is referenced in D&C 8:2-3?",
            answers: [
                "Creation of the world",
                "The Exodus from Egypt",
                "Moses parting the Red Sea",
                "The giving of the Ten Commandments"
            ],
            correctAnswer: 2
        }
    );

    // Add to D&C 13:1
    doctrinalMasteryScriptures[5].questions.push(
        {
            type: "content",
            question: "Who restored the Aaronic Priesthood to Joseph Smith?",
            answers: [
                "Moroni",
                "Peter, James, and John",
                "John the Baptist",
                "Elijah"
            ],
            correctAnswer: 2
        },
        {
            type: "doctrine",
            question: "According to D&C 13:1, what ordinance is authorized by the Aaronic Priesthood?",
            answers: [
                "Eternal marriage",
                "Conferring the gift of the Holy Ghost",
                "Baptism by immersion for the remission of sins",
                "Patriarchal blessings"
            ],
            correctAnswer: 2
        }
    );

    // Add to D&C 18:10-11
    doctrinalMasteryScriptures[6].questions.push(
        {
            type: "content",
            question: "In D&C 18:10, what does the Lord say about the worth of souls?",
            answers: [
                "The worth of souls is measured by their righteousness",
                "The worth of souls is great in the sight of God",
                "The worth of souls is determined by their works",
                "The worth of souls varies from person to person"
            ],
            correctAnswer: 1
        },
        {
            type: "doctrine",
            question: "What does D&C 18:10-11 teach about why Jesus suffered and died?",
            answers: [
                "To establish His Church",
                "To prove His power",
                "That all might repent and come unto Him",
                "To create a legacy"
            ],
            correctAnswer: 2
        }
    );

    // Add to D&C 18:15-16
    doctrinalMasteryScriptures[7].questions.push(
        {
            type: "content",
            question: "According to D&C 18:15-16, what brings great joy?",
            answers: [
                "Gaining worldly possessions",
                "Bringing souls unto Christ",
                "Being admired by others",
                "Living a long life"
            ],
            correctAnswer: 1
        },
        {
            type: "doctrine",
            question: "What does D&C 18:15-16 teach about missionary work?",
            answers: [
                "It's only for full-time missionaries",
                "It brings great joy even if only one soul is brought to Christ",
                "It's only effective in foreign countries",
                "It's not as important as other Church work"
            ],
            correctAnswer: 1
        }
    );

    // Add to D&C 19:16-19
    doctrinalMasteryScriptures[8].questions.push(
        {
            type: "content",
            question: "In D&C 19:16-19, who is speaking about suffering for sins?",
            answers: [
                "Joseph Smith",
                "God the Father",
                "Jesus Christ",
                "Martin Harris"
            ],
            correctAnswer: 2
        },
        {
            type: "doctrine",
            question: "According to D&C 19:16-19, what happens if people don't repent?",
            answers: [
                "They will immediately be punished",
                "They must suffer even as Christ suffered",
                "They will be banished from society",
                "They will lose their memory of God"
            ],
            correctAnswer: 1
        }
    );

    // Add to D&C 21:4-6
    doctrinalMasteryScriptures[9].questions.push(
        {
            type: "content",
            question: "In D&C 21:4-6, how are we told to receive the prophet's words?",
            answers: [
                "With our own interpretation",
                "As if from God's own mouth",
                "Based on popular opinion",
                "If they match our personal views"
            ],
            correctAnswer: 1
        },
        {
            type: "content",
            question: "What protection is promised in D&C 21:6 for following the prophet?",
            answers: [
                "Financial security",
                "The gates of hell shall not prevail against you",
                "Perfect health",
                "Academic success"
            ],
            correctAnswer: 1
        }
    );

    // Add to D&C 25:13
    doctrinalMasteryScriptures[10].questions.push(
        {
            type: "content",
            question: "In D&C 25:13, what should we do with our covenants?",
            answers: [
                "Redefine them",
                "Cleave unto them",
                "Occasionally remember them",
                "Keep them private"
            ],
            correctAnswer: 1
        },
        {
            type: "doctrine",
            question: "What emotions does D&C 25:13 encourage us to have?",
            answers: [
                "Solemn reverence",
                "Lift up our hearts and rejoice",
                "Serious meditation",
                "Quiet reflection"
            ],
            correctAnswer: 1
        }
    );

    // Add to D&C 58:42-43
    doctrinalMasteryScriptures[11].questions.push(
        {
            type: "content",
            question: "According to D&C 58:42-43, what are the two essential elements of true repentance?",
            answers: [
                "Feeling sad and making restitution",
                "Praying and attending church",
                "Confessing and forsaking the sin",
                "Apologizing and promising to do better"
            ],
            correctAnswer: 2
        },
        {
            type: "doctrine",
            question: "What does D&C 58:42 teach about how completely God forgives?",
            answers: [
                "He forgives but maintains a record of sins",
                "He forgives and remembers our sins no more",
                "He forgives based on the severity of the sin",
                "He forgives but may bring up past sins later"
            ],
            correctAnswer: 1
        }
    );
}
