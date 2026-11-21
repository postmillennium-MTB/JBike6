# JBike6

A test bench for bicycle motion. It computes the open-loop stability of a bicycle from the linearized Whipple–Carvallo equations (four rigid bodies) and lets you change the geometry, mass and speed while watching the eigenvalues, ride response and control properties update.

Open `index.html` in a browser. There is no build step and no server.

## What is in the bench
- **Stability**: root locus of the eigenvalues against forward speed, with weave speed, capsize speed and the self-stable window read out above it.
- **Geometry**: 2D blueprint and 3D view with principal-inertia glyphs and draggable centers of mass.
- **Ride test**: roll-perturbation time response at a chosen speed.
- **Wheel lab**: wheel sizes, mullet setups, frame pitch and gyroscopic contribution.
- **Control lab**: state-space matrices, eigenmodes, transfer functions and pole-zero maps.
- **Stability landscape** and **Design optimization**: scan two parameters across a speed range.

## Files
| File | Purpose |
| --- | --- |
| `index.html` | The app: markup, model, and canvas drawing |
| `instrument-ui.css` | Visual system (vellum, ink blue, one red reserved for instability) |
| `*.js` | Feature modules: eigenmode lab, pole-zero lab, landscape, optimization, controls |
| `tests/` | Node tests, run with `node --test tests/*.test.js` |
| `original Matlab files/` | The original JBike6 MATLAB GUI and help files |
| `FinalBicyclePaper_v45_with_Appendix.pdf` | Reference paper |
| `CONTROL_THEORY_AUDIT.md` | Notes on the control-theory checks |

## Color meaning
Blue marks selection and interaction. Red marks instability and nothing else. Green marks stability. Ochre marks the rider and rear assembly in the geometry views.

## Origin
Based on JBike6 by Schwab, Papadopoulos, Ruina and Dressel (Delft University of Technology and Cornell University), 2003-2015. The original MATLAB release history and license are preserved below.

---

## Original JBike6 release notes and license

this was created with most recent 2015-02-08 - main folder: 1,085,915 bytes (1.2 MB on disk) for 28 items

http://ruina.tam.cornell.edu/research/topics/bicycle_mechanics/JBike6_web_folder/index.htm

JBike6 Download

Temporary format, until JBike6 is finalized.
Select a version to download below.

(2015-02-08) Avoid trouble when plotting alpha angle orientation
- Disable unavailable printer setup diaglog on Macs, per Pier de Jong

JBike6GUI_2015_02_08.zip

(2014-11-02) Replace all instances of '\' with filesep

JBike6GUI_2014_11_02.zip

(2012-09-09) Support new fileparts() in MATLAB version 7.11+
- Fix Tipping_moment calculation, per rearwheelsteer group
- Better support CTRL+D, per Piet Lammertse
- Clean up coordinates converting to XY after reading from file

JBike6GUI_2012_09_09.zip

(2006-10-21) Flip fork Ucm along with trail and wheelbase
- Fix bug in loading bike (in UV) when GUI set to XY
- Allow (63+1+1) characters in file name, instead of 64
- Prevent commas in file names, not allowed by MATLAB
- Enforce MATLAB''s 63 character root name length
- Protect against too long file names from other sources
- Display fork offset in figure
- Add button of ''flip'' fork, calculate new trail and wb
- Rerequire mass off ground to avoid 'det mass matrix < 0'
- Fix bug if too few datapoints for JBRoots.m
- lower minimum eigenvalue for stability threshold
- Option to shade stable region and pick color
- Use minimum eigenvalue for stability threshold
- Allow no mass in front end
- (now handled better in JBaddb, JBvcrit, and JBpolyint)
- Allow all mass on the ground
- Re-enable stability calculation, make v6.0 compatible
- use strrep() instead of regexprep() for v6.0 compatibility
- use findstr() instead of strfind() for v6.0 compatibility
- Correct some create_fcn names in JBike6GUI.fig
- Temporarily disable stability calculation
- Calculate and display max and total stability
- Check for and warn about tipping forward
- Better control drawing of vert lines and limits
- Include new file, JBike6Control.m, for Control tollbox
- Update help
- Replace blanks with zeros on 'Calculate' button
- Better handle launching help on different system
- New control to draw additional plots
- Change menu name from 'styles' to 'plot styles'
- Add menu options for 'bigger styles' and 'smaller styles'
- Change 'Click for more information' to 'Help: click for ...'
- Change 'Using JBike6...' to 'Help: using JBike6...'
- Add tooltips for 'U', 'V', and 'alpha'
- Fix copyright on separate 4 plot window'
- Use web command instead of dos command to launch help

JBike6GUI_2006_10_21.zip

Please email us with questions or comments.





http://ruina.tam.cornell.edu/research/topics/bicycle_mechanics/JBike6_web_folder/JBike6_license_agreement.htm

JBike6 End User License Agreement

NOTICE TO USER: PLEASE READ THIS CONTRACT CAREFULLY. BY USING ALL OR ANY PORTION OF THE JBIKE6 SOFTWARE ("SOFTWARE") YOU ACCEPT ALL THE TERMS AND CONDITIONS OF THIS AGREEMENT, INCLUDING, IN PARTICULAR THE LIMITATIONS ON: USE CONTAINED IN SECTION 2; TRANSFERABILITY IN SECTION 4; WARRANTY IN SECTION 6; AND LIABILITY IN SECTION 7. YOU AGREE THAT THIS AGREEMENT IS ENFORCEABLE LIKE ANY WRITTEN NEGOTIATED AGREEMENT SIGNED BY YOU. THIS AGREEMENT IS ENFORCEABLE AGAINST YOU AND ANY LEGAL ENTITY THAT OBTAINED THE SOFTWARE AND ON WHOSE BEHALF IT IS USED. IF YOU DO NOT AGREE, DO NOT USE THIS SOFTWARE.

The Authors own all intellectual property in the Software. The Authors permit you to Use the Software only in accordance with the terms of this Agreement. Use of some third party materials included in the Software may be subject to other terms and conditions typically found in a separate license agreement or "Read Me" file located near such materials.

1. Definitions. "Software" means (a) all of the contents of the files, disk(s), CD-ROM(s) or other media with which this Agreement is provided, including but not limited to (i) computer information or software; (ii) related explanatory written materials or files ("Documentation"); and (b) upgrades, modified versions, updates, additions, and copies of the Software, if any, licensed to you by the Authors (collectively, "Updates"). "Use" or "Using" means to access, install, download, copy or otherwise benefit from using the functionality of the Software in accordance with the Documentation. "Computer" means an electronic device that accepts information in digital or similar form and manipulates it for a specific result based on a sequence of instructions. "The Authors" means Arend L. Schwab and Jim Papadopoulos.

2. Software License. As long as you comply with the terms of this Software License Agreement (this "Agreement"), the Authors grant to you a non-exclusive license to Use the Software for the purposes described in the Documentation.

2.1 General Use. You may install and Use a copy of the Software on your compatible computer.

2.2 Backup Copy. You may make one backup copy of the Software, provided your backup copy is not installed or used on any computer. You may not transfer the rights to a backup copy unless you transfer all rights in the Software as provided under Section 4.

2.3 Portable or Home Computer Use. In addition to the single copy permitted under Section 2.2, the primary user of the computer on which the Software is installed may make a second copy of the Software for his or her exclusive use on either a portable Computer or a Computer located at his or her home, provided the Software on the portable or home Computer is not used at the same time as the Software on the primary computer.

3. Intellectual Property Ownership, Copyright Protection. The Software and any authorized copies that you make are the intellectual property of and are owned by the Authors. The Software is protected by law, including without limitation the copyright laws of the United States and other countries, and by international treaty provisions. Except as expressly stated herein, this Agreement does not grant you any intellectual property rights in the Software and all rights not expressly granted are reserved by the Authors.

4. Restrictions.

4.1 Notices. You shall not copy the Software except as set forth in Section 2. Any copy of the Software that you make must contain the same copyright and other proprietary notices that appear on or in the Software.

4.2 Transfer. You may not, rent, lease, sublicense, assign or transfer your rights in the Software, or authorize all or any portion of the Software to be copied onto another user's computer except as may be expressly permitted herein. You may, however, transfer all your rights to Use the Software to another person or legal entity provided that: (a) you also transfer (i) this Agreement, and (ii) the Software and all other software or hardware bundled or pre-installed with the Software, including all copies, Updates and prior versions, to such person or entity; (b) you retain no copies, including backups and copies stored on a computer; and (c) the receiving party accepts the terms and conditions of this Agreement and any other terms and conditions upon which you legally purchased a license to the Software.

5. Updates. If the Software is an Update to a previous version of the Software, you must possess a valid license to such previous version in order to Use such Update. All Updates are provided to you on a license exchange basis. You agree that by Using an Update you voluntarily terminate your right to use any previous version of the Software. As an exception, you may continue to Use previous versions of the Software on your Computer after you Use the Update but only to assist you in the transition to the Update, provided that: (a) the Update and the previous versions are installed on the same computer; (b) the previous versions or copies thereof are not transferred to another party or Computer unless all copies of the Update are also transferred to such party or Computer; and (c) you acknowledge that any obligation the Authors may have to support the previous versions of the Software may be ended upon availability of the Update.

6. NO WARRANTY. The Software is being delivered to you "AS IS" and the Authors make no warranty as to its use or performance. THE AUTHORS DO NOT AND CANNOT WARRANT THE PERFORMANCE OR RESULTS YOU MAY OBTAIN BY USING THE SOFTWARE. EXCEPT FOR ANY WARRANTY, CONDITION, REPRESENTATION OR TERM TO THE EXTENT TO WHICH THE SAME CANNOT OR MAY NOT BE EXCLUDED OR LIMITED BY LAW APPLICABLE TO YOU IN YOUR JURISDICTION, THE AUTHORS MAKE NO WARRANTIES CONDITIONS, REPRESENTATIONS, OR TERMS (EXPRESS OR IMPLIED WHETHER BY STATUTE, COMMON LAW, CUSTOM, USAGE OR OTHERWISE) AS TO ANY MATTER INCLUDING WITHOUT LIMITATION NONINFRINGEMENT OF THIRD PARTY RIGHTS, MERCHANTABILITY, INTEGRATION, SATISFACTORY QUALITY, OR FITNESS FOR ANY PARTICULAR PURPOSE. The provisions of Section 6 and Section 7 shall survive the termination of this Agreement, howsoever caused, but this shall not imply or create any continued right to Use the Software after termination of this Agreement.

7. LIMITATION OF LIABILITY. IN NO EVENT WILL THE AUTHORS BE LIABLE TO YOU FOR ANY DAMAGES, CLAIMS OR COSTS WHATSOEVER OR ANY CONSEQUENTIAL, INDIRECT, INCIDENTAL DAMAGES, OR ANY LOST PROFITS OR LOST SAVINGS, EVEN IF A REPRESENTATIVE OF THE AUTHORS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH LOSS, DAMAGES, CLAIMS OR COSTS OR FOR ANY CLAIM BY ANY THIRD PARTY. THE FOREGOING LIMITATIONS AND EXCLUSIONS APPLY TO THE EXTENT PERMITTED BY APPLICABLE LAW IN YOUR JURISDICTION. THE AGGREGATE LIABILITY OF THE AUTHORS UNDER OR IN CONNECTION WITH THIS AGREEMENT SHALL BE LIMITED TO THE AMOUNT PAID TO THE AUTHORS FOR THE SOFTWARE, IF ANY.

8. Export Rules. You agree that the Software will not be shipped, transferred or exported into any country or used in any manner prohibited by the United States Export Administration Act or any other export laws, restrictions or regulations (collectively the "Export Laws"). In addition, if the Software is identified as export controlled items under the Export Laws, you represent and warrant that you are not a citizen, or otherwise located within, an embargoed nation (including without limitation Iran, Iraq, Syria, Sudan, Libya, Cuba, North Korea, and Serbia) and that you are not otherwise prohibited under the Export Laws from receiving the Software. All rights to Use the Software are granted on condition that such rights are forfeited if you fail to comply with the terms of this Agreement.

9. Governing Law. This Agreement will be governed by and construed in accordance with the substantive laws in force in the State of New York. The respective court of Tompkins County shall have non-exclusive jurisdiction over all disputes relating to this Agreement. This Agreement will not be governed by the conflict of law rules of any jurisdiction or the United Nations Convention on Contracts for the International Sale of Goods, the application of which is expressly excluded.

10. General Provisions. If any part of this Agreement is found void and unenforceable, it will not affect the validity of the balance of this Agreement, which shall remain valid and enforceable according to its terms. This Agreement shall not prejudice the statutory rights of any party dealing as a consumer. This Agreement may only be modified by a writing signed by the Authors or their authorized representative. Updates may be licensed to you by the Authors with additional or different terms. This is the entire agreement between the Authors and you relating to the Software and it supersedes any prior representations, discussions, undertakings, communications or advertising relating to the Software.

11. Compliance with Licenses. If you are a business or organization, you agree that upon request from the Authors or their authorized representative, you will within thirty (30) days fully document and certify that use of any and all Software at the time of the request is in conformity with your valid licenses from the Authors.

If you have any questions regarding this Agreement or if you wish to request any information from the Authors please use the address and contact information included with this product to contact them.

JBike6 is a trademark of the Authors in the United States and/or other countries.

Please email us with questions or comments.

Copyright © 2003-2015 Schwab, Papadopoulos, Ruina, & Dressel, Delft University of Technology & Cornell University






# ideas for improvement: 

I spent time looking through the actual `index.html`, and I think there's something considerably more interesting here than a bicycle calculator.

**My biggest recommendation is to develop JBike6 into an interactive bicycle engineering laboratory.** Something that makes complicated bicycle dynamics understandable, lets engineers experiment, and gives mountain bikers a way to investigate why different design choices produce different outcomes.

You already have much of the foundation. I would build on it rather than start over.

# **1. My overall assessment**



Strong foundation

Significant expansion potential



The application already connects several sophisticated elements:

**1. Bicycle configuration**

Wheel diameters, frame geometry, rider mass, component mass, center of mass and gravity.

**2. Whipple–Carvallo physics engine**

Mass properties, equations of motion and eigenvalue calculations.

**3. Stability analysis**

Weave speed, capsize speed, self-stable operating window and root-locus visualization.

**4. Dynamic simulation**

Roll and steer perturbations, animated bicycle response and time-series plots.

**5. Control theory laboratory**

State-space matrices, transfer functions, poles, zeros and PID feedback.

That is an impressive combination. You're not simply displaying bicycle geometry. You're connecting physical parameters to mathematical behavior and then visualizing the results.

The master recomputation pipeline is a particularly good organizing concept: changes to the bike feed through the model, stability analysis, KPIs and simulation.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://raw.githubusercontent.com\&sz=32)

GitHub



# **2. What I particularly like**

**A. The Mullet & Wheel Lab**

This might actually be your most interesting differentiator.

The ability to switch between wheel combinations, adjust diameters, change gyroscopic contribution and simulate frame pitch is compelling.

[2024 Nukeproof Mega 297 Alloy Pro – Specs, Comparisons, Reviews – 99 Spokes](https://images.openai.com/static-rsc-4/f4-ZFJE4759Al9Wrh_c1ImI1aQCQMxrkpSBdkRPIaBjyA-D3WU7i4aqH54o5l4mNrdJWa_kvQtsJyrssAKK1eMv5Hesp6-tbcjFSLXPvBLgQ-acn4yO3t7w6zwrEpJCp7C3jbftE98Ytcd9Tr0ra8U8XqP_PA3S-NDGYfF7PIHA?purpose=inline)

[99spokes.com](https://99spokes.com/bikes/nukeproof/2024/mega-297-alloy-pro?utm_source=chatgpt.com)

I would take this considerably further.

Imagine a dedicated experiment called:

**Does a Mullet Bike Actually Handle Differently?**

The user could compare:

- Full 29er versus 29/27.5 mullet.
- Same geometry versus geometry adjusted for the different rear wheel.
- Same wheel mass versus automatically scaled wheel mass.
- Normal gyroscopic contribution versus reduced contribution.
- Same head angle versus simulated frame pitch.

Then show which effects come from wheel inertia, geometry, and mass distribution.

You already have much of the underlying machinery. The auto-scaling and pitch-simulation controls are present.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://postmillennium-mtb.github.io\&sz=32)

postmillennium-mtb.github.io



One important addition: let users enter measured wheel assembly mass and inertia rather than relying exclusively on generic scaling assumptions.

**B. The eigenvalue root-locus visualization**

[Function Reference: sgrid](https://images.openai.com/static-rsc-4/Yyys8FneU2URQGlxEv0CnDPTLN2i_dW8xRyQOhdrGp6L9Brg2mJywlCFl9Lee2rdgpxaM9YzsLW4uVnFRsmQ4JhMU1nNSteQvdIO81YQWbIiNtRIUfLz4Di3O3ky53yzmjsytQGoTKvgCVlYCmK5wVkmo_-aGA242d8FKXQcjHw?purpose=inline)

[octave.sourceforge.io](https://octave.sourceforge.io/control/function/sgrid.html?utm_source=chatgpt.com)

This is one of the most sophisticated parts of your project.

The 2D and 3D views offer two different ways of understanding stability. The 3D version, in particular, has potential to become a signature feature.

I would make the visualization more interactive.

For example, clicking an eigenvalue should reveal:

- Which physical mode it represents.
- Its oscillation frequency.
- Its growth or decay rate.
- What happens to the bicycle at that particular speed.
- An animation of the corresponding roll and steering behavior.

Right now, users can explore the eigenvalue branches and click speeds to initiate a perturbation experiment. The next step is connecting those two experiences more explicitly.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://raw.githubusercontent.com\&sz=32)

GitHub



**C. The Control Theory Lab**

This is a surprisingly ambitious addition.

I like that you haven't hidden the mathematics. Exposing the matrices, transfer functions, poles and zeros makes the project interesting to people who want to understand how bicycle control actually works.

I would retain this functionality, but make it an explicitly advanced workspace rather than something every new user needs to understand immediately.

# **3. Five creative features I would seriously consider**

These are the improvements I think could move JBike6 from an interesting technical project to something genuinely distinctive.

## **Idea 1: The Bicycle Stability Landscape**

My favorite proposed feature

Imagine an interactive heatmap that displays bicycle stability across two adjustable design parameters.

For example:

- Horizontal axis: head tube angle.
- Vertical axis: fork offset.
- Color: width of the self-stable speed window.

[Moteus performance analysis tool - v2 - mjbots blog](https://images.openai.com/static-rsc-4/Jlra2N0IuTjyZB6Pb2B_jdVQsfn53OiSAdxYsZaCT_MgJNA9tdf2dsCLZX0igGgART5_d9gYarWB_a1z8AG6m8Ooc8Z9HZwD6eALJ_uPC4FymjpLloxtCmOuEey-fO6V_u5mfDgtHTxS4qBfKBiJNb4ZluKJoqY8DWVoMfiAMOM?purpose=inline)

[blog.mjbots.com](https://blog.mjbots.com/2025/07/17/moteus-performance-analysis-tool-v2/?utm_source=chatgpt.com)

The user could move a cursor across the landscape and instantly see:

- Weave onset speed.
- Capsize onset speed.
- Self-stable window.
- Mechanical trail.
- Changes in stability relative to the baseline.

You could also switch the axes to wheelbase, rider center of mass, wheel inertia or other parameters.

This is much more revealing than moving one slider at a time.

It could answer questions like:

*Which combination of head angle and fork offset produces the largest self-stable operating window?*

That is an actual engineering exploration tool.

## **Idea 2: Bicycle Dynamics Cinema**

Imagine being able to watch the mathematical behavior of the bicycle rather than simply looking at a graph.

[Extensions of the Whipple Model — Human Control of a Bicycle: Jason K. Moore](https://images.openai.com/static-rsc-4/_Oixe3rzquWsfdrbHLOw59TN5gtYpX1GpL5NmTdktAFcs2kNlTV_YrXthdrHAlF4AqdpnSWn0cMDorRZYfqwbGNv0nV0zWYNRcyyMXJJj0D94w_Ao1U-P9kkGPTqIxVFWaGSQ8nV7XESh2Vr5c6Kcf0VbJRkGJve8pWbuJEsBN8?purpose=inline)

[moorepants.github.io](https://moorepants.github.io/dissertation/extensions.html?utm_source=chatgpt.com)

Create three selectable animation modes:

**Weave mode:** The bicycle oscillates in roll and steering, with the amplitude growing or shrinking.

**Capsize mode:** The bicycle slowly develops an inward roll deviation.

**Countersteering mode:** The handlebars initially turn in the opposite direction from the eventual lean and turn.

The third one would be particularly interesting because it connects the control-theory laboratory to something riders can actually observe and feel.

I'd make it possible to adjust speed and watch the behavior change.

## **Idea 3: Build Your Actual Mountain Bike**

This is where I would lean heavily into MTB engineering.

[Nevada 29 1.0 LTD – Fuji Bikes Europe](https://images.openai.com/static-rsc-4/D9DUm6L_wRKVCdcrcRJhMtWrCp-HUS0rpYjdvDiqcMH3f4dwKPhpoDizUidcEJL9IPVMw_GB3tvyW8fvjAo-CyirifPrnLnJbmS_jy_J0_zi8WJSSNHf0WpoJEaB8intdm6NqRUsPnCTsUcFCSiBd-ATfZtZ4dZvbyedYLqPLY8?purpose=inline)

[fujibikes.eu](https://www.fujibikes.eu/products/nevada-29-1-0-ltd?utm_source=chatgpt.com)

Instead of starting with generic presets, users could build a virtual representation of their own bicycle.

Inputs:

- Frame geometry.
- Wheel and tire dimensions.
- Fork offset.
- Head angle.
- Wheelbase.
- Component masses.
- Rider mass and position.
- Component centers of mass.

Then generate a saved bicycle profile.

I would eventually include a library of real-world bicycle profiles, but only with verified geometry and clearly identified sources.

One particularly useful addition would be a distinction between manufacturer geometry and measured geometry.

This could become a community-submitted bicycle database.

## **Idea 4: The A/B Engineering Comparison Lab**

You already have a Pin Baseline feature. This is a natural place to expand.

[image](https://www.google.com/s2/favicons?domain=https://raw.githubusercontent.com\&sz=32)

GitHub

I envision something like this:

## **Compare two bicycle configurations**

**BIKE A**

# **29 / 29**

Baseline configuration

**BIKE B**

# **29 / 27.5**

Modified configuration

| Metric           | Bike A     | Bike B     |
| ---------------- | ---------- | ---------- |
| Weave speed      | Calculated | Calculated |
| Capsize speed    | Calculated | Calculated |
| Stable window    | Calculated | Calculated |
| Mechanical trail | Calculated | Calculated |

**Difference analysis**

Highlight the parameters that changed, the resulting stability changes and the underlying assumptions.

I'd also let users overlay the eigenvalue plots.

One technical improvement: save the complete configuration parameters when pinning a baseline, not just the resulting sweep data and stability thresholds.

## **Idea 5: The Bicycle Engineering Knowledge Base**

This could be an especially powerful educational feature.

Every important parameter gets an interactive explanation.

For example, clicking mechanical trail opens an explanation with:

- What mechanical trail is.
- How it is calculated.
- How fork offset changes it.
- How wheel radius changes it.
- How it relates to the larger Whipple model.
- What it does *not* tell you about actual handling.

You could have the same functionality for gyroscopic effects, mass distribution, wheel inertia, weave, capsize and countersteering.

This gives people a reason to explore the application even when they don't understand the mathematics.

# **4. Specific improvements to the existing code**

Now for the more technical review.

I looked at the current published `index.html`, which is approximately 4,658 lines.

There are some things I'd address before adding a lot more functionality.

| Area               | My recommendation                                                                           | Priority |
| ------------------ | ------------------------------------------------------------------------------------------- | -------- |
| Code organization  | Separate physics, UI, rendering and styles into modules                                     | High     |
| JSON import        | Implement deep merging and comprehensive parameter validation                               | High     |
| Mobile interaction | Standardize mouse and touch handling with Pointer Events                                    | High     |
| Accessibility      | Add keyboard navigation and accessible visualization alternatives                           | Medium   |
| Performance        | Avoid unnecessarily repeating the entire stability calculation during rapid slider movement | Medium   |
| Animation          | Stop scheduling empty animation frames when the simulator is paused                         | Low      |

A few specifics:

**Code organization**

Your JavaScript is already divided into numbered functional sections and uses an application state object. That's a reasonable foundation.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://raw.githubusercontent.com\&sz=32)

GitHub



However, I would start separating the file into:

```
JBike6/
│
├── index.html
│
├── css/
│   └── styles.css
│
├── js/
│   ├── physics-engine.js
│   ├── stability-analysis.js
│   ├── control-theory.js
│   ├── simulation.js
│   ├── visualizations.js
│   ├── interface.js
│   └── app.js
│
├── tests/
│
└── documentation/
```

That will make future development considerably easier.

**JSON configuration**

I noticed the JSON importer validates the wheelbase and head angle, then shallow-merges the supplied configuration over the defaults.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://raw.githubusercontent.com\&sz=32)

GitHub



I'd improve that. A partially supplied nested object, such as rider mass properties, could replace an entire default object and leave required values undefined.

Implement recursive merging, field-by-field validation and sensible physical bounds.

**Mobile interaction**

The geometry visualization supports both mouse and touch interactions. However, the 3D root-locus interaction uses mouse events, rather than equivalent touch handling.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://raw.githubusercontent.com\&sz=32)

GitHub



I'd standardize both using Pointer Events.

Also, the canvas visualizations deserve keyboard-accessible controls and textual alternatives.

**Performance**

Your `recomputeAll()` routine performs a complete stability sweep and regenerates the perturbation simulation. This is called by numerous interactive controls.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://raw.githubusercontent.com\&sz=32)

GitHub



As you expand the number of parameters and visualizations, consider debouncing rapid slider changes and moving intensive numerical calculations into a Web Worker.

These aren't reasons to abandon your current architecture. They're opportunities to make it more robust.

# **5. One important scientific consideration**

I would make the distinction between theoretical bicycle stability and real-world mountain bike handling extremely clear.

Your model is based on the linearized Whipple–Carvallo framework. That is valuable, but it isn't a complete model of a modern mountain bike.

For instance, the application doesn't represent all of the following real-world effects:

- Suspension dynamics.
- Tire deformation and grip.
- Terrain interaction.
- Frame and component flexibility.
- Braking and acceleration.
- Nonlinear behavior at larger lean angles.
- The full complexity of human rider feedback.

The separate PID controller is a useful way to explore hypothetical steering feedback, but it isn't a complete human rider model.

I'd introduce a prominent **Model Assumptions & Limitations** panel, with explanations of which physical effects are included and omitted.

This actually enhances the credibility of the application. I would rather see JBike6 make precise claims about what it calculates than suggest it predicts every aspect of how a bike feels.

I haven't independently validated every numerical coefficient against the original MATLAB implementation, so consider this a source-code, product and scientific-framing review rather than a completed mathematical audit.

# **6. What I would make JBike6 look and feel like**

Here's the direction I'd take the overall product.

**JBike6**

Engineering Lab

# **Explore Bicycle Dynamics**

Build a bicycle. Change its geometry. Discover what happens.

**Choose your experiment**

[2024 YT Industries Capra CORE 4 29 – Specs, Comparisons, Reviews – 99 Spokes](https://images.openai.com/static-rsc-4/1EWuQYPLELwyd7Xb3L91MemIucil7Nj0_Q11w0ibvCU_BRe8BxBGjWiAxATzA1srlZgXmqAkZD72_qpPD7GzTczaBsYLRw_s-76NQLdQaa9KEIYmRXnrYe2EmqMPlovm1xrG1utFPrmiX-NxO0fMJtY4unbmAiNl2KTbqOn79tU?purpose=inline)

**Geometry Lab**

Explore trail, head angle and wheelbase.

[Santa Cruz Bronson GX AXS | SPOKE](https://images.openai.com/static-rsc-4/XBM-VyK8xukLj9DTDZdM1JwQMK80w-p8O54xaZh5abdEamSzlfV9KDyvVpeh935XZyc-BFy0U-Ha6yVfmyTFuMeLJ8VPlho-k4x7rx8VzDl1j5lifS7ZULSCBCTQ1fyo7XSJGmAwyW2pcSTzwBxozb9NcTSA_3DbeK8tlMLFvp4?purpose=inline)

**Wheel Lab**

Explore wheel diameter, mass and inertia.

[13. NB. Linear Stability Analysis Using Orr-Sommerfeld Equation — An Introduction to Spectral Methods](https://images.openai.com/static-rsc-4/4EgsZhrlKiX8hD_Wxxaq2228YdTC1UWPbK_RVhCGK2m4Tnkp5UoIC8voSJx6_HkwuePJ-aE22Jf2_FQ0Q2_Glx-4C1JKT5_nweghrlv22-CYoJkhN2D1iIAMpBJpKdOuIcn8CwhOvMEdfAjlq2yZM3dcMAegbQumceqvQlvz6Ic?purpose=inline)

**Stability Lab**

Discover weave and capsize behavior.

[SSM → HIPPO → LSSL → S4 → Mamba → Mamba2 | Unknown NLP Lab](https://images.openai.com/static-rsc-4/5pMLrnfI12I4L665-29P-zn8FNew_q8EfZeHWnl1ooL6nIXMHebjEnZNeO_1tAZqeIDPt-rxQnSPIQPOZP2Wt2WYiLlhWO_3PDQKpFdGggwoEUu5z7XvF8zkkG1MkxMsrl0e6o-VkegMGPYIqc_jcqzUW2cFZqCTbM1EPD7p6lE?purpose=inline)

**Control Lab**

Investigate steering feedback and control theory.

**Your current bicycle**

**Modern Enduro Mullet**

29-inch front / 27.5-inch rear

Editable

One shared physics engine powers all four laboratories. Advanced mathematical details remain available whenever users want them.

That's the conceptual direction, not a reconstruction of your current application.

I would retain the scientific depth but introduce a more approachable front door. Beginners shouldn't have to understand state-space matrices before they can discover something interesting.

# **7. My recommended development order**

If I were directing development, here's how I'd prioritize the next iterations:

1. **First: A/B Engineering Comparison**

   Build on your existing Pin Baseline functionality. This offers immediate value without fundamentally changing the application.
2. **Second: Bicycle Stability Landscape**

   Introduce parameter-space heatmaps. This would be a major expansion of the engineering capabilities.
3. **Third: Mode Animation**

   Connect eigenvalues, eigenvectors and time-domain behavior through interactive animations.
4. **Fourth: Actual Bicycle Profiles**

   Let people model their own bikes and save/share configurations.
5. **Fifth: Modularize and expand testing**

   Separate the calculation engine from the interface and strengthen numerical verification as features grow.

## **My final thought**

I think your greatest opportunity is to build something that occupies a relatively unusual intersection:

**Bicycle engineering + applied mathematics + interactive scientific visualization.**

There are plenty of bicycle geometry calculators. There are mathematical implementations of bicycle dynamics. There are also engineering visualization tools.

JBike6 could bring those things together in an accessible, engaging environment.

And I wouldn't limit its audience to mountain bikers. Bicycle engineers, university students, researchers, frame designers, suspension engineers and technically curious riders could all find something worthwhile in it.

**The single feature I'd build next is the Bicycle Stability Landscape.** It would change the application from a tool for adjusting parameters into a tool for discovering relationships between parameters. That's a much bigger leap than simply adding more sliders.
