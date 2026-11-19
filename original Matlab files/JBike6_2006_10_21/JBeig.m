% JBeig.m

% Created by Arend L. Schwab and Jim Papadopoulos, 18-Jun-2003
% Copyright © 2003-2006 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University

% This Matlab script calculates the eigenvalues and eigenvectors
% from the lienarized equations of motion for the bicycle
% M0, C1, K0 and K2 must me set by JBmck
%
% The forward speed v is in the range 0 to 10 divided in 101 points.
%
% The eigenvalues are stored in lamb(101,4)
% The eigenvectors are stored as a list of 4*4=16 numbers in Lamb(101,4*4)

% Modification History
% 11/01/05 AED - New user parameter: vel_steps 
% 11/03/05 AED - New user parameter: min_vel
% Nov-18-2003 Schwab, changed the eigenvalue problem from A*V=V*D to  A*V = B*V*D

v=linspace(min_vel, ... %minumum velocity
           max_vel, ... %maximum velocity
           vel_steps ... %destretization
           );

n=length(v);
lamb=zeros(n,4);
Lamb=zeros(n,4*4);
for i=1:n
  M=M0;
  C=C1.*v(i);
  K=K0+K2.*v(i)^2;
% Eigenvalue problem A*V = B*V*D
  B=[M zeros(2); zeros(2) eye(2)];
  A=[-C -K; eye(2) zeros(2)];
  [V,D]=eig(A,B);
  lamb(i,:)=diag(D).';
  Lamb(i,:)=V(:).';
end


