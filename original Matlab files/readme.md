these four folders were downloaded from http://ruina.tam.cornell.edu/research/topics/bicycle_mechanics/JBike6_web_folder/JBike6_download.htm
this is the JBike6GUI_2015_02_08.zip

*IMPORTANT*
ALWAYS give attribution to the authors of these files per the license agreement here: 
http://ruina.tam.cornell.edu/research/topics/bicycle_mechanics/JBike6_web_folder/JBike6_license_agreement.htm

Copyright © 2003-2015 Schwab, Papadopoulos, Ruina, & Dressel, Delft University of Technology & Cornell University


2015_02_08 is the most recent version of the MATLAB files: 
< START >
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
< END >
