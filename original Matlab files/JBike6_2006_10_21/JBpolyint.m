function A=JBpolyint(p)

% Created by Arend L. Schwab , 8-Nov-2003
% Copyright © 2003-2006 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University

% Make an interval list A in x where the polynomial p(x) is positive.
% For the definition of a polynomial see f.i. 'help polyval'
% An interval list is a list of values and codes. The value is where the
% interval value changes and the code is the code for the next interval.
% For codes we use here 1 for positive and 0 for negative.
% An example of an interval list is:
% A=[-Inf 0; 3 1; 5 0] for
%           |++++++++++|
%   --------|          |---------
% -Inf      3          5      +Inf
% -Inf to  3  negative, 3  to  5  positive, and 5  to Inf negative.
% Modification History
%10/03/06 AED  - Better handle case of no mass at all,
%                do nothing if polynomial is all zeros

% start with a positive interval from -Inf to Inf
A=[-Inf 1];
% find the roots of the polynomial
r=roots(p);
% the polynomial is the product (Pi) of these roots as in 
% p(x)=Pi_i(x-r_i), with these products we make the intervals
% combine the intervals with the ~xor function which is according
% to the rules for multiplication of the signs.
for i=1:length(r)
    if isreal(r(i))
        Ri=[-Inf 0; r(i) 1];
        A=JBcombint(A,Ri,@notxor);
    end
end
% determine the  behaviour of p(-Inf) by 
% finding the first nonzero coefficient of p and its sign
k=min(find(p~=0));
if ~isempty(k) % if none found
    n=length(p)-k;
    sgn=sign(p(k))*(-1)^n;
    code=round((sgn+1)/2);
    % check the behaviour at p(-Inf) and iff negate all codes
    if A(1,2)~=code
        A(:,2)=~A(:,2);
    end
else % make sure intervals come out correctly
    A=[-Inf 0];
end

function c=notxor(a,b)
% The negation of the XOR logical function
% This resembles multiplication where +1=1 and -1=0
% a b ~xor
% 1 1   1
% 1 0   0
% 0 1   0
% 0 0   1

% Created by Arend L. Schwab , 7-Nov-2003
% Delft University of Technology & Cornell University.

c=~xor(a,b);