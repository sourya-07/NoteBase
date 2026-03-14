export const initialSubjects = [
  {
    id: "phenomenology-of-space",
    name: "Phenomenology of Space",
    docCount: 14,
    lastUpdated: "Oct 12, 2026",
    documents: [
      { id: "doc-1", name: "bachelard_poetics_of_space.pdf" },
      { id: "doc-2", name: "merleau_ponty_perception_notes.txt" },
      { id: "doc-3", name: "heidegger_building_dwelling_thinking.md" },
      { id: "doc-4", name: "spatial_cognition_study.json" }
    ]
  },
  {
    id: "post-industrial-urbanism",
    name: "Post-Industrial Urbanism",
    docCount: 32,
    lastUpdated: "Sep 28, 2026",
    documents: [
      { id: "doc-5", name: "detroit_deindustrialization_report.pdf" },
      { id: "doc-6", name: "harvey_condition_of_postmodernity.txt" },
      { id: "doc-7", name: "ruin_gaze_essay.md" }
    ]
  },
  {
    id: "early-modern-typography",
    name: "Early Modern Typography",
    docCount: 8,
    lastUpdated: "Aug 14, 2026",
    documents: [
      { id: "doc-8", name: "gutenberg_printing_press_history.txt" },
      { id: "doc-9", name: "aldus_manutius_italics.pdf" }
    ]
  },
  {
    id: "biological-systems-design",
    name: "Biological Systems Design",
    docCount: 21,
    lastUpdated: "Jul 30, 2026",
    documents: [
      { id: "doc-10", name: "biomimicry_principles.md" },
      { id: "doc-11", name: "self_organizing_systems_notes.txt" }
    ]
  },
  {
    id: "aesthetics-of-decay",
    name: "Aesthetics of Decay",
    docCount: 5,
    lastUpdated: "Jun 11, 2026",
    documents: [
      { id: "doc-12", name: "wabi_sabi_philosophy.txt" },
      { id: "doc-13", name: "rust_and_dust_textures.json" }
    ]
  }
];

export const mockQAResponses = {
  "what is the default mode network?": {
    answer: "The Default Mode Network (DMN) is a network of interacting brain regions that is active when a person is not focused on the outside world <sup>[1]</sup>. It was first detailed by Marcus Raichle in 2001, who noticed that certain brain regions consume high amounts of energy even during passive rest <sup>[2]</sup>. The DMN is strongly associated with daydreaming, self-referential thought, theory of mind, and autobiographical memory <sup>[1]</sup><sup>[3]</sup>.",
    sources: [
      { id: "s-1", name: "raichle_default_mode.pdf", url: "file:///Users/souryagupta/Desktop/rag_chatbot/endee_assignment/tests/test_docs/raichle_default_mode.pdf" },
      { id: "s-2", name: "neuroscience_intro_ch4.txt", url: "file:///Users/souryagupta/Desktop/rag_chatbot/endee_assignment/tests/test_docs/neuroscience_intro_ch4.txt" },
      { id: "s-3", name: "self_and_consciousness_study.md", url: "file:///Users/souryagupta/Desktop/rag_chatbot/endee_assignment/tests/test_docs/self_and_consciousness_study.md" }
    ],
    metrics: {
      faithfulness: 0.96,
      relevancy: 0.98,
      latency: 0.82
    },
    chunks: [
      "The Default Mode Network (DMN) comprises the medial prefrontal cortex, posterior cingulate cortex, and precuneus. It exhibits high activity during introspection and decreases in metabolic rate when engaging in goal-oriented tasks.",
      "Raichle (2001) coined the term default mode to describe the baseline state of brain activity. This network is central to ego-functioning and autobiographical mental simulation.",
      "When we rest, the brain does not shut down. Rather, regions designated as the DMN interact dynamically, allowing for internal narrative construction."
    ]
  },
  "summarise the key arguments in the uploaded papers": {
    answer: "The uploaded documents present two primary arguments regarding cognitive architectures. First, they argue that bodily state mapping is critical to emotional experience, a process conceptualized by Damasio's somatic marker hypothesis <sup>[1]</sup>. Second, they propose that space is not a passive container but rather a phenomenological construction built through active motor exploration and bodily orientation <sup>[2]</sup><sup>[3]</sup>.",
    sources: [
      { id: "s-4", name: "damasio_somatic_markers.pdf", url: "file:///Users/souryagupta/Desktop/rag_chatbot/endee_assignment/tests/test_docs/damasio_somatic_markers.pdf" },
      { id: "s-5", name: "merleau_ponty_perception_notes.txt", url: "file:///Users/souryagupta/Desktop/rag_chatbot/endee_assignment/tests/test_docs/merleau_ponty_perception_notes.txt" },
      { id: "s-6", name: "spatial_exploration_framework.md", url: "file:///Users/souryagupta/Desktop/rag_chatbot/endee_assignment/tests/test_docs/spatial_exploration_framework.md" }
    ],
    metrics: {
      faithfulness: 0.91,
      relevancy: 0.94,
      latency: 1.15
    },
    chunks: [
      "Damasio posits that emotions are cognitive processes triggered by somatic responses. Somatic markers arise from bioregulatory processes that signal somatic states, altering decision-making outcomes.",
      "Merleau-Ponty argues that spatial orientation is rooted in body-schema. We do not place our bodies in space; our bodies are the anchor of space.",
      "The construct of space is phenomenological, active, and bodily. Sensorimotor exploration feeds spatial mapping pipelines."
    ]
  },
  "what did i note about somatic markers?": {
    answer: "According to your notes, somatic markers are bodily sensations (such as changes in heart rate, muscle tension, or gut feelings) that are associated with past experiences <sup>[1]</sup>. The brain maps these visceral responses and uses them to rapidly filter decision options, acting as an automated bias warning system before conscious deliberation begins <sup>[2]</sup>. This explains why damage to the ventromedial prefrontal cortex disrupts decision-making despite normal IQ <sup>[1]</sup>.",
    sources: [
      { id: "s-7", name: "damasio_somatic_markers.pdf", url: "file:///Users/souryagupta/Desktop/rag_chatbot/endee_assignment/tests/test_docs/damasio_somatic_markers.pdf" },
      { id: "s-8", name: "emotion_and_reasoning_notes.md", url: "file:///Users/souryagupta/Desktop/rag_chatbot/endee_assignment/tests/test_docs/emotion_and_reasoning_notes.md" }
    ],
    metrics: {
      faithfulness: 0.98,
      relevancy: 0.97,
      latency: 0.68
    },
    chunks: [
      "Somatic markers function as autonomic feedback loops. Ventromedial damage compromises the retrieval of somatic signals, impairing real-world reasoning while keeping theoretical cognitive intelligence intact.",
      "Notes: somatic markers bypass long analytical trees by applying gut-feeling weights to decisions, serving as an evolutionary shortcut to reasoning."
    ]
  }
};
