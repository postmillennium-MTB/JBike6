function JBdrawcircle(xc,yc,radius)

% Created by Arend L. Schwab and Jim Papadopoulos, 18-Jun-2003
% Copyright © 2003-2006 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University

p=linspace(0,2*pi,100);
X=radius.*cos(p)+xc;
Y=radius.*sin(p)+yc;
line(X,Y)
