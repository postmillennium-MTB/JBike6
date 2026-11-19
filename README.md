# JBike6
A Benchmark for Bicycle Motion

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
