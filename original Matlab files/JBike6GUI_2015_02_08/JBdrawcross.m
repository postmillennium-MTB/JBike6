function JBdrawcross(xc,yc,length)

% Created by Arend L. Schwab and Jim Papadopoulos, 18-Jun-2003
% Copyright © 2003-2006 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University

line([xc-length xc+length],[yc yc])
line([xc xc],[yc-length yc+length])
