% Created by Andrew Dressel, 10-9-2003
% Copyright © 2003-2006 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University
%
% Plug JBike6 into MATLAB's Control System Toolbox
%
% From JBike6
% The linearized equations of motion read:
%
%       M0*qdd+(C1.*v)*qd+(K0+K2.*v^2)*q=0
%
% where v is the forward speed of the bike.
%
% Requires MATLAB’s Control System Toolbox

% set the bicycle parameters
JBini

% calculate the linearized equations of motion
JBmck

% calculate the weave and capsize speed
JBvcrit

% calculate the eigenvalues and eigenvectors for a speed range
JBeig

% plot only the Real part of the eigenvalues
subplot(2,2,1); 
JBrev
title('JBike6'); a = axis;
drawnow;

% create transfer function from state-space representation
% use x1 = q1, x2 = q1_dot, x3 = q2, x4 = q2_dot
subplot(2,2,2); 
v = 0:0.1:10;
M = inv(M0);
for i = 1: length(v)
    S = M*(C1.*v(i));
    K = M*(K0 + K2.*v(i)^2);
    A = -[0,      -1,     0,      0;
          K(1,1), S(1,1), K(1,2), S(1,2);
          0,      0,      0,      -1;
          K(2,1), S(2,1), K(2,2), S(2,2)];

    B = [0, 0,      0, 0;
         0, M(1,1), 0, M(1,2);
         0, 0,      0, 0;
         0, M(2,1), 0, M(2,2)];

    C = [1, 0, 0, 0];
    D = [0, 0, 0, 0];
    [numG, denG] = ss2tf(A, B, C, D, 2);
    G = tf(numG, denG);
    [p, z] = pzmap(G);
    plot(v(i).*ones(1, length(p)), p, '.'); hold on;
end
title('Poles of Transfer Function');
xlabel('Forward speed (m/s)');
ylabel('Real(\lambda)');

v = [1.0 6.0]
plot([v(1) v(1)], [-10 10]);
plot([v(2) v(2)], [-10 10]);
grid on; hold off; axis(a);

% now draw root locus at v=1.0 and 6.0
for i=1:length(v)
    M = inv(M0);
    S = M*(C1.*v(i));
    K = M*(K0 + K2.*v(i)^2);
    A = -[0,      -1,     0,      0;
          K(1,1), S(1,1), K(1,2), S(1,2);
          0,      0,      0,      -1;
          K(2,1), S(2,1), K(2,2), S(2,2)];

    B = [0, 0,      0, 0;
         0, M(1,1), 0, M(1,2);
         0, 0,      0, 0;
         0, M(2,1), 0, M(2,2)];

    C = [1, 0, 0, 0];
    D = [0, 0, 0, 0];
    [numG, denG] = ss2tf(A, B, C, D, 2);
    G = tf(numG, denG);

    subplot(2,2,2+i); 
    rlocus(G)
    title(sprintf('Root Locus for v=%d',v(i)));
end

