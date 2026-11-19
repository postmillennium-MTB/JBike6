% JBdoubleroot.m

% Created by Arend L. Schwab 18-Oct-2005
% Copyright © 2003-2006 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University

% Modification History
% 10/31/05 Schwab - new
% 11/10/05 AED - Display more digits
% 11/15/05 AED - option to run in 'verbose' mode or not

% This Matlab script determines the forward speeds where two
% roots form a conjugated or vise versa.
% uses MATLAB's symbolic toolbox

syms v x
Apt = Apc;
Bpt = Bpc*[v; 1];
Cpt = Cpc*[v^2; v; 1];
Dpt = Dpc*[v^3; v^2; v; 1];
Ept = Epc*[v^2; v; 1];

% p is characteristic polynomial
p = Apt*x^4 + Bpt*x^3 + Cpt*x^2 + Dpt*x + Ept;

% At a douple root, both p and dp/dx must vanish
sol = solve(p, diff(p, 'x'));

% Unfortunately, there are now 16 solutions from 
% which we seek the ones which are real and positive
vs = double(sol.v);
xs = double(sol.x);

% Pick out the real and positive v
% and since isreal() may not really do the job, due
% to round-off, better to use abs(imag(vs))<1e-14
vdr = [];
ldr = [];
for i=1:length(vs)
  if abs(imag(vs(i)))<1e-14 & vs(i)>0
    vdr = [vdr; real(vs(i))];
    ldr = [ldr; real(xs(i))];
  end
end
if run_verbose == 1
    %disp('    v         lambda')
    disp(sprintf('\t v \t\t\t\t\t lambda'))
    for i = 1:length(vdr)
        disp(sprintf('\t %1.16f \t %1.16f', vdr(i), ldr(i))); % more digits
    end
    %disp([vdr ldr])
end