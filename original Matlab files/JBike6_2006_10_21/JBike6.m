% JBike6.m

% Created by Arend L. Schwab and Jim Papadopoulos, 18-Jun-2003
% Copyright © 2003-2006 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University

%***********************************************************
%
% This is an example session for analysing the stability
% of an upright bicycle, rigid rider and no hands.
%
% JBike6 is the successor of Jbike5, a Fortran program 
% which was written by William Krauss and Jim Papadopoulos
% around June 1988.

% Modification History
% 11/01/05 AED - call new JBvroot
% 11/07/05 AED - force GUI unless user edits this file
% 11/08/05 AED - Change JBvroot to JBdroot
% 11/10/05 AED - Split JBdroot into JBdoubleroots and JBroots
% 11/15/05 AED - Move display of MO, C1, K0, and K2 to JBmck.m
% 09/11/06 AED - Remove comments about running JBike6GUI.m

%**********************************************************
%
% The following couple of lines is designed to help users
% find and use the GUI. If you are more comfortable with
% command-line MATLAB, set the use_GUI variable to 0, or
% make an equivalent change, to skip the GUI. 
%
%***********************************************************
use_GUI = 1 % 1 = launch GUI, 0 = no GUI
if use_GUI == 1 % if user wants the GUI
    JBike6GUI % launch the GUI
else

    % set the bicycle parameters
    JBini

    % draw the bike
    JBfig

    % calculate the linearized equations of motion
    JBmck
    
    % calculate the capsize speed
    %JBvcap % now in JBvcrit
    % calculate the weave speed
    %JBvweave % now in JBvcrit
    % calculate the weave and capsize speed
    JBvcrit

    % calculate double root speed(s)
    if double_root_method == 0 % 0 = analytically
        JBdoubleroots; % analytical (uses Symbolic tool box)
    end

    % calculate the igenvalues and eigenvectors for a speed range
    JBeig

    % calculate double root speed(s)
    if double_root_method == 1 % 1 = interpolate from eigenvalues
        JBroots;        
    end

    % plot these eigenvalues as a function of the speed
    JBplot4

    % plot only the Real part of the eigenvalues
    figure
    JBrev
end
