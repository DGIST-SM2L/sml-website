# SML Lab Website - DGIST

## Overview
Build a modern, responsive lab website for **SML (Soft Matter Lab)** at **DGIST** using **Next.js 14+ (App Router)** with **Tailwind CSS**. Deploy-ready for Vercel.

## Design Direction
- Modern, clean, minimal academic website
- Dark/light mode toggle
- Smooth scroll animations (framer-motion)
- Color scheme: professional blue/slate tones
- Responsive (mobile-first)
- English as primary language

## Pages

### 1. Home (`/`)
- Hero section with lab name: **"Soft Matter Lab"** and tagline
- Brief intro (use text below)
- Research highlights (card grid linking to /research)
- Latest publications preview (3 most recent)
- "Join Us" CTA section

**Intro text (English):**
> Our group develops and applies mesoscale simulation models and computational tools to investigate structural, thermodynamic, and dynamic phenomena in various soft matter systems, including polymer melts, liquid crystalline polymers, networked polymers, amphiphilic polymers, and polymer brushes. We also combine artificial intelligence and data-driven technologies to develop novel polymer materials and systems.

**Intro text (Korean):**
> XXXXX

### 2. Research (`/research`)
Three main categories with expandable detail cards:

**A. Developing Mathematical Models for Complex Polymeric Systems**
- Coarse-grained Model of Bottlebrushes
- Morphological Diversity in Graft-Linear Block Copolymer(BCPs)
- Mesoscale Simulation Model for Solution Assembly
- Solution Assembly of Amphiphilic Grafting Polymer
- Modeling of EUV Photoresist & Patterning Process
- High-resolution Patterning Combined with EUV and DSA
- Dielectric Spectroscopy of Low Permittivity Polymers
- Infiltration of Biopolymers into Mesoporous Particles
- Solvent Vapor Annealing
- Nanoscale Organic Lattices with Strongly-Correlated Disorder

**B. Materials/Systems Design through Data Science and Machine Learning**
- Defect Detection and Classification
- HAPPY (HierArchically Abstracted rePeat unit of PolYmer) - Novel String Representation
- Battery State-of-Health(SOH) Prediction
- Molecular Dynamic Simulations Combined with Machine Learning

**C. Non-simple Boundary and Its Effects on Self-assembly**
- Emulsified BCP droplets
- Boundary Directed Epitaxy

### 3. Publications (`/publications`)
- Rendered from `/content/publications.json`
- Grouped by year (newest first)
- Each entry: authors, title (linked to DOI), journal, volume, year
- Search/filter functionality
- "Featured" badge for highlighted papers

**Initial publications data (include all from old site):**

```json
[
  {
    "year": 2025,
    "authors": "Intizar Abbas, Tran Thi Huyen Tran, Tran Thi Ngoc Tran, Thuy Linh Pham, Eui-Chol Shin, Chan-woo Park, Sung-Bong Yu, Oh Jeong Lee, An-Giang Nguyen, Hoon-Hwe Cho, Jongwoo Lim, Su-Mi Hur, Chan-Jin Park, Jaekook Kim, Jong-Sook Lee",
    "title": "GITT limitations and EIS insights into Linetics of NMC622",
    "journal": "Batteries",
    "volume": "11(6), 234",
    "doi": "https://www.mdpi.com/2313-0105/11/6/234"
  },
  {
    "year": 2024,
    "authors": "Jaka Fajar Fatriansyah, Muhmad Rafi Aquila, Iping Suhariadi, Andreas Federico, Dzaky Iman Ajiputro, Agrin Febrian Pradana, Yossi Andreano, Muhammad Ali Yafi Rizky, Donanta Dhaneswara, Zainovia Lockman, Su-Mi Hur",
    "title": "Machine learning assisted tensile strength prediction and optimization of Ti Alloy",
    "journal": "IEEE ACCESS",
    "volume": "10.1109 (2024) 3450511",
    "doi": "https://ieeexplore.ieee.org/abstract/document/10649554"
  },
  {
    "year": 2024,
    "authors": "Yejin Ku, Gayoung Kim, Min Seung Kim, Jin-Kyun Lee, Jiho Kim, Byeong-Gyu Park, Sangsul Lee, Seohyeon Lee, Byung Jun Jung, Changhyeon Lee, Hyunseok Kim, Su-Mi Hur, Chawon Koh, Tsunehiro Nishi, Hyun-Woo Kim",
    "title": "Approach for enhancing sensitivity of tin-oxo cluster resist for high NA extreme UV lithography",
    "journal": "Proc. SPIE 12957, Advances in Patterning Materials and Processes XLI",
    "volume": "1295706",
    "doi": "https://doi.org/10.1117/12.3010838"
  },
  {
    "year": 2024,
    "authors": "Yun Hee Ko, Hyeji Lee, Hyunseok Kim, Seungjun Kim, Chanjae Ahn, Su-Mi Hur, Yoonhyun Kwak, Myungwoong Kim",
    "title": "Chemical Structure–Physicochemical Property Relationships of Copolymers Utilizable for Negative-Tone Photoimaging via Chemical Amplification",
    "journal": "ACS Appl. Mater. Interfaces",
    "volume": "16, 12, 15286–15297",
    "doi": "https://pubs.acs.org/doi/full/10.1021/acsami.3c19522"
  },
  {
    "year": 2022,
    "authors": "Juhae Park, Vikram Thapar, Yeojin Choe, Luis Adrian Padilla Salas, Abelardo Ramírez-Hernández, Juan J. de Pablo, Su-Mi Hur",
    "title": "Coarse-grained Simulation of Bottlebrush: From Single-Chain Properties to Self-Assembly",
    "journal": "ACS Macro Letters",
    "volume": "11, 9, 1167-1173",
    "doi": "https://pubs.acs.org/doi/full/10.1021/acsmacrolett.2c00310"
  },
  {
    "year": 2022,
    "authors": "Eun Ji Kim, Jaeman J. Shin, Gue Seon Lee, Sejong Kim, Sora Park, Juhae Park, Yeojin Choe, Dahye Lee, Jinwoong Choi, Joona Bang, Young Hun Kim, Sheng Li, Su-Mi Hur, Jeung Gon Kim, Bumjoon J. Kim",
    "title": "Synthesis and Self-Assembly of Poly(vinylpyridine)-Containing Brush Block Copolymers",
    "journal": "Macromolecules",
    "volume": "55, 5, 1590-1599",
    "doi": "https://pubs.acs.org/doi/full/10.1021/acs.macromol.1c02631"
  },
  {
    "year": 2021,
    "authors": "EJ Kim, J J. Shin, T Do, GS Lee, J Park, V Thapar, J Choi, J Bang, GR Yi, SM Hur, JG Kim, BJ Kim",
    "title": "Molecular Weight Dependent Morphological Transitions of Bottlebrush Block Copolymer Particles: Experiments and Simulations",
    "journal": "ACS Nano",
    "volume": "15 (3), 5513-5522",
    "doi": "https://pubs.acs.org/doi/full/10.1021/acsnano.1c00263"
  },
  {
    "year": 2020,
    "authors": "RM Jacobberger, V Thapar, GP Wu, TH Chang, V Saraswat, AJ Way, KR Jinkins, Z Ma, PF Nealey, SM Hur, S Xiong, MS Arnold",
    "title": "Boundary-directed epitaxy of block copolymers",
    "journal": "Nature Communications",
    "volume": "11, 4151",
    "doi": "https://www.nature.com/articles/s41467-020-17938-3",
    "featured": true
  },
  {
    "year": 2019,
    "authors": "W Wei, TY Kim, A Balamurugan, J Sun, R Chen, A Ghosh, F Rodolakis, J L McChesney, A Lakkham, P G Evans, SM Hur, P Gopalan",
    "title": "Phase Behavior of Mixed Polymer Brushes Grown from Ultrathin Coatings",
    "journal": "ACS Macro Letters",
    "volume": "8 (9), 1086-1090",
    "doi": "https://pubs.acs.org/doi/full/10.1021/acsmacrolett.9b00501"
  }
]
```

### 4. People (`/people`)
- PI section (large card with photo placeholder)
- Group members grid (photo placeholder + info cards)
- Alumni section (collapsible)

**PI:**
- Name: Su-Mi Hur (허수미)
- Title: Professor, DGIST
- Department: XXXXX
- Education:
  - Ph.D., Chemical Engineering, UC Santa Barbara (2006-2011)
  - M.S., Chemical Engineering, Seoul National University (2000-2002)
  - B.S., Chemical Engineering, Seoul National University (1996-2000)
- Experience:
  - Professor, DGIST (2025-present)
  - Professor, Chonnam National University (2015-2024)
  - Postdoc, Argonne National Lab (2014-2015)
  - Postdoc, University of Chicago (2012-2014)
  - Postdoc, University of Wisconsin, Madison (2012)
- Awards:
  - LG Chem Mid-Career Academic Award (2024)
  - ASML Research Incentive Award (2018)
  - ASML Tech Talk Young Prof Award (2017)
  - Doh Wonsuk Memorial Award (2010)
  - IBM Ph.D. Fellowship Award (2009, 2010)
- Email: XXXXX
- Phone: XXXXX
- Office: XXXXX

**Current Members:**

| Name | Position | Research Theme | Education |
|------|----------|---------------|-----------|
| Allan Pérez Ramírez | Postdoc | Boundary Directed Epitaxy, Dielectric Spectroscopy | Ph.D., Metropolitan Autonomous University |
| Vikram Thapar | Postdoc | Kinetics and Thermodynamics of BCP thin films | Ph.D., Cornell University |
| Jihun Ahn | Postdoc | Machine Learning for Materials Design, MD: Phase Transition of 2D Colloidal System | Ph.D., Chonnam National University |
| Gabriella Pasya Irianti | Combined M.S./Ph.D. | CG-MD of Polymeric Systems, ML for Materials Design | B.S., University of Indonesia |
| Sehyun Yun | M.S. student | DSA on VIA Pattern, ML for Battery SOH | B.S., Chonnam National University |
| Raehyun Jung | Combined B.S./M.S. | ML for Battery SOH, Mesoporous Particle-Polymer | B.S., Chonnam National University |
| Hyunseok Kim | Combined B.S./M.S. | EUV Lithography, Polymer Rod Brush | B.S., Chonnam National University |
| Sangyeop Lee | Combined B.S./M.S. | Bottlebrush Polymer Phase (CG Simulation) | B.S., Chonnam National University |
| Seunggeon Lee | Undergraduate | MD for Anion Exchange Membrane | Chonnam National University |

### 5. Contact (`/contact`)
- Map embed (DGIST location): 333 Techno jungang-daero, Hyeonpung-eup, Dalseong-gun, Daegu
- Contact info: XXXXX
- Contact form (or mailto link)

## Technical Requirements
- Next.js 14+ with App Router
- Tailwind CSS v4
- TypeScript
- framer-motion for animations
- Content from JSON/MDX files in `/content/` directory
- SEO optimized (metadata, OpenGraph)
- Responsive design
- Dark/light mode (next-themes)
- Deploy-ready for Vercel

## File Structure
```
sml-website/
├── app/
│   ├── layout.tsx
│   ├── page.tsx          # Home
│   ├── research/page.tsx
│   ├── publications/page.tsx
│   ├── people/page.tsx
│   └── contact/page.tsx
├── components/
│   ├── Header.tsx        # Nav with dark mode toggle
│   ├── Footer.tsx
│   ├── ThemeProvider.tsx
│   └── ...
├── content/
│   ├── publications.json
│   ├── members.json
│   └── research.json
├── public/
│   └── images/           # Photo placeholders
├── tailwind.config.ts
└── package.json
```

## Notes
- Use XXXXX as placeholder for any missing information
- Image placeholders: use colored div with initials or generic avatar
- The site should look complete and professional even with placeholders
- Make it easy to update content by editing JSON files in /content/
