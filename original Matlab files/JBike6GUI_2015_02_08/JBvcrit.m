% JBvcrit.m

% Created by Arend L. Schwab 22-Aug-2003
% Copyright © 2003-2006 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University

% Modification History
% (8/22/03) Updated JBvcrit.m so that it no longer reqires
%           MATLAB's Symbolic Tool Box.
% (8/18/03) New: replaces both JBvcap.m and JBvweave.m
% - Updated weave speed calculation with Arend's fix
% (10/09/03) Updated JBvcrit.m so that it returns NaN for
%            vweave or vcapsize if they are not found.
% (10/09/03) Schwab, fixed the stable speed range calculation by adding
% interval calculus, see JBpolyint.m and JBcombint.m
%10/03/06 AED  - Better handle case of Determinant of Mass Matrix = 0
%                Use just disp() instead of warning()
%                It is less messy in MATLAB's command window

% This Matlab script calculates the stable speed range from the linearized
% equations of motion of the bike. The stable speed range usually starts at
% the the so-called weave speed and ends at the so called capsize speed. At
% the weave speed the bike shows undamped oscilatory motion and at the
% capsize speed the bike becomes non-oscilatory unstable. 

% Method:
% For the linearized equations of motion
% M0*qdd+C1*v*qd+(K0+K2*v^2)*q=0
% we assume eigensolutions of the form q=q0*exp(x*t) and
% we construct the eigenvalue problem
% det(M0*x^2+C1*v*x+K0+K2*v^2)=0 which leads to
% a characteristic equation of the form
% A*x^4+B*x^3+C*x^2+D*x+E=0
% For all roots to have negative real parts I use the
% Lienard-Chipart conditions, in these conditions the number of
% determinantal inequalities is roughly half that in the conditions
% of Routh_Hurwitz. (See f.i. F. Gantmacher, Lectures in Analytical
% Mechanics, MIR Moscow, 1970)
% The Lienard-Chipart Conditions:
% For a polynomial 
% a_0*x^n + a_1*x^n-1 + ... + a_n-1*x + a_n=0
% with a0>0 to have all roots with negative real parts, it is necesary
% and sufficient that
% (1) a_1>0, a_2>0,...,a_n>0
% (2) D_n-1>0,D_n-3>0,...
% Here D_k denotes the Hurwitz determinant of the kth order.
% Note that the coefficients of the characteristic equation are
% themselve polynomials in the forward speed v.
%
% My results are in accordance with Hand 1988 application of the 
% Routh-Hurwith criterium (Chap.V) in particular eqns (4.1) until (4.5)
% and eqn (4.7a) BCD=AD^2+EB^2.

% Determine the polynomial coefficients of the characteristic equation,
% themself polynomials in the forward speed v. 
% Here I have preprocessed the work with the symbolic toolbox, 
% see matlab script JBchareqn.m
% First copy the entries from M0 C1 K0 K2 into variables without 
% indices and with short names (a symbolic toolbox deficit).
m1=M0(1,1); m2=M0(1,2); m3=M0(2,2);
c1=C1(1,2); c2=C1(2,1); c3=C1(2,2);
k01=K0(1,1); k02=K0(1,2); k03=K0(2,2);
k21=K2(1,2); k22=K2(2,2);
% Second construct the coefficents of the characteristic equation
% A*x^4+B*x^3+C*x^2+D*x+E=0
% The coefficients are themself polynomials in the forward speed v
% Note the Matlab order for the coefficients of a polynomial
% f.i. 2*v^3+7*v^2+1  -> [2 7 0 1]
Apc=[(m1*m3-m2^2)];
Bpc=[(m1*c3-m2*c2-c1*m2) 0];
Cpc=[(m1*k22-c1*c2-k21*m2) 0 (m1*k03+k01*m3-2*m2*k02)];
Dpc=[(-k21*c2) 0 (k01*c3-c1*k02-k02*c2) 0];
Epc=[(k01*k22-k21*k02) 0 (k01*k03-k02^2)];
% The determinant of the massmatrix is equal to Apc
if Apc(1)==0
    disp('Warning: Determinant of Mass Matrix = 0')
end
if Apc(1)<0
    error('Determinant of Mass Matrix < 0')
end

% The only Hurwitz determinants we need are D_1 and D_3.
% D_1 is equivalent to B. D_3 coincides with the condition 
% on the oscilatory solution having zero real part, the weave speed. 
% Rename D_3 into F:
% F=B*C*D-A*D^2-E*B^2
% Multiply the polynomials out (taking the convolute) to obtain F
BCD=conv(conv(Bpc,Cpc),Dpc);
ADD=conv(conv(Apc,Dpc),Dpc);
EBB=conv(conv(Epc,Bpc),Bpc);
% The maximal degree of polynomials is 6 so 7 coefficients.
% In order to be able to add the polynomials we will pad
% the polynomials with leading zeros if they are shorter than 7. 
BCD=[zeros(1,7-length(BCD)) BCD];
ADD=[zeros(1,7-length(ADD)) ADD];
EBB=[zeros(1,7-length(EBB)) EBB];
Fpc=BCD-ADD-EBB;
% Now use the results from the interval calculus, 
% see JBpolyint.m and JBcombint.m. 
% An interval list is a list of values and codes. The value is where the
% interval value changes and the code is the code for the next interval.
% For codes we use here 1 for positive and 0 for negative.
% An example of an inteval list is:
% A=[-Inf 0; 3 1; 5 0] for
%           |++++++++++|
%   --------|          |---------
% -Inf      3          5      +Inf
% -Inf to  3  negative, 3  to  5  positive, and 5  to Inf negative.
% Start with a positive interval from 0 to Inf
Vsi=[-Inf 0; 0 1];
% Combine the intervals with AND to get the common positive interval
Vsi=JBcombint(Vsi,JBpolyint(Apc),@and);
Vsi=JBcombint(Vsi,JBpolyint(Bpc),@and);
Vsi=JBcombint(Vsi,JBpolyint(Cpc),@and);
Vsi=JBcombint(Vsi,JBpolyint(Dpc),@and);
Vsi=JBcombint(Vsi,JBpolyint(Epc),@and);
Vsi=JBcombint(Vsi,JBpolyint(Fpc),@and);
% Echo the interval list in v for which the bike is stable
% Vsi
% Assign weave speed and capsize speed if present
[m,n]=size(Vsi);
switch m
    case 1
        vweave=NaN; vcapsize=NaN;
    case 2
        vweave=Vsi(2,1); vcapsize=NaN;
    case 3
        vweave=Vsi(2,1); vcapsize=Vsi(3,1);
    otherwise
       nsi=sum(Vsi(:,2));
       error(sprintf('There are %g stable intervals',nsi))
end
