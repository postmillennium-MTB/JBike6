function JBdrawinertia(xc,yc,m,I,alphaI)

% Created by Arend L. Schwab and Jim Papadopoulos, 18-Jun-2003
% Copyright © 2003-2006 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University

if m~=0
  rhs=3/m.*I.';
  A=[0 1 1; 1 0 1; 1 1 0];
  xyz2=inv(A)*rhs;
  % in case of negative values non-physical Inertia tensor!
  x=sqrt(xyz2(1));
  y=sqrt(xyz2(2));
  z=sqrt(xyz2(3));
  
  areadensity=400;
  %this is kg/m^2
  radius=sqrt((m/6)/(areadensity*pi));
  
  ca=cos(alphaI);
  sa=sin(alphaI);
% add a circle at the origin
  JBdrawcircle(xc     ,yc     ,radius)
  JBdrawcircle(xc+x*ca,yc+x*sa,radius)
  JBdrawcircle(xc-x*ca,yc-x*sa,radius)
  JBdrawcircle(xc+y*(-sa),yc+y*ca,radius)
  JBdrawcircle(xc-y*(-sa),yc-y*ca,radius)
  
  line([xc-x*ca xc+x*ca],[yc-x*sa yc+x*sa])
  line([xc-y*(-sa) xc+y*(-sa)],[yc-y*ca yc+y*ca])
end
