function C=JBcombine(A,B,fcombi)

% Created by Arend L. Schwab , 7-Nov-2003
% Copyright © 2003-2006 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University

% Combine two interval lists A and B into a new interval list C
% where fcombi is the function handle of the function which combines
% the interval codes, c=fcombi(a,b)
% An interval list is a list of values and codes. The value is where the
% interval value changes and the code is the code for the next interval.
% For codes we use here 1 for positive and 0 for negative.
% An example of an inteval list is:
% A=[-Inf 0; 3 1; 5 0] for
%           |++++++++++|
%   --------|          |---------
% -Inf      3          5      +Inf
% -Inf to  3  negative, 3  to  5  positive, and 5  to Inf negative.

% Add B all but the first intervals to A with code NaN
Bm=B(2:end,:);
Bm(:,2)=NaN;
AB=[A;Bm];
% Sort the entries
AB=sortrows(AB);
% Add A all but the first intervals to B with code NaN
Am=A(2:end,:);
Am(:,2)=NaN;
BA=[B;Am];
% Sort the entries
BA=sortrows(BA);
% Assign the proper codes for the inserted entries (code=NaN)
% The proper code is the code from the previous entry in the list
[m,n]=size(AB);
for k=2:m
   if isnan(AB(k,2))
       AB(k,2)=AB(k-1,2);
   end
   if isnan(BA(k,2))
       BA(k,2)=BA(k-1,2);
   end
end
% The combined entries in the list are either AB or BA
C=AB;
% Apply the function fcombi to get the combined code
C(:,2)=feval(fcombi,AB(:,2),BA(:,2));
% The combined list can have adjacent entries with the same code
% Cleanup the list from these repetitive entries
eq=[0; C(2:end,2)==C(1:end-1,2)];
C=C(~eq,:);