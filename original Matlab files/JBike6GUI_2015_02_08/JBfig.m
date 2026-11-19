% JBfig.m
% Draw the geometry, mass and inertia of the bike in a new figure
% First run the bicycle parameter file

% Created by Arend L. Schwab and Jim Papadopoulos, 18-Jun-2003
% Copyright © 2003-2006 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University

%h=figure; %let GUI decide where

% Modification History
% 11/29/05 AED - draw steering axis as dotted line


lambda = pi/2-head_angle;

line([-0.5*wheelbase 1.5*wheelbase],[0 0])

JBdrawcircle(0,Drearwheel/2,Drearwheel/2)
rmass=sqrt(Drearwheel^2/4-(mrearwheel/(400*pi)));
JBdrawcircle(0,Drearwheel/2,rmass)
if mrearwheel~=0
  JBdrawcircle(0,Drearwheel/2,sqrt(Irearwheel(3)/mrearwheel))
end
JBdrawcross(0,Drearwheel/2,0.05)

JBdrawcircle(wheelbase,Dfrontwheel/2,Dfrontwheel/2)
rmass=sqrt(Dfrontwheel^2/4-(mfrontwheel/(400*pi)));
JBdrawcircle(wheelbase,Dfrontwheel/2,rmass)
if mfrontwheel~=0
  JBdrawcircle(wheelbase,Dfrontwheel/2,sqrt(Ifrontwheel(3)/mfrontwheel))
end
JBdrawcross(wheelbase,Dfrontwheel/2,0.05)

p=[wheelbase+trail 0];
q=p+1.*[-sin(lambda) cos(lambda)];
%line([p(1) q(1)],[p(2) q(2)])
hold on;
plot([p(1) q(1)],[p(2) q(2)], ':');
hold off;

JBdrawinertia(xcmrider,ycmrider,mrider,Irider,alphaIrider)
JBdrawinertia(xcmrack,ycmrack,mrack,Irack,alphaIrack)
JBdrawinertia(xcmframe,ycmframe,mframe,Iframe,alphaIframe)

Rl=[cos(lambda) -sin(lambda); sin(lambda) cos(lambda)];
Ol=[wheelbase+trail; 0];

p=Ol+Rl*[0+ucmfork; vcmfork];
xcmfork=p(1);
ycmfork=p(2);
JBdrawinertia(xcmfork,ycmfork,mfork,Ifork,alphaIfork)

p=Ol+Rl*[ucmbasket; vcmbasket];
xcmbasket=p(1);
ycmbasket=p(2);
JBdrawinertia(xcmbasket,ycmbasket,mbasket,Ibasket,alphaIbasket)

title(name)

axis equal
axis off
drawnow
