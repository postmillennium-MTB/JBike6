% JBdroot.m

% Created by Andrew Dressel, 12-11-2005
% Copyright © 2003-2006 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University

% This Matlab script determines the forward speeds where two
% roots form a conjugated or vise versa.

% Modification History
% 11/09/05 AED - New algorithm to interpolate from calculated eigenvalues
% 11/10/05 AED - Display more digits
%              - Try interpolating with more dots, but no better
% 11/15/05 AED - option to run in 'verbose' mode or not
% 12/08/05 AED - return after warnings & handle 2nd root better
% 12/09/05 AED - find 2nd double root instead of warning about it.
% 12/11/05 AED - fix bug in finding 3rd root.
% 10/12/06 AED - fix bug in handling too few data points. Warn instead.

% sort the lambdas
lambdas=sort(lamb,2);
ReL=real(lambdas);
ImL=imag(lambdas);
sReL=sort(ReL.').';
sImL=sort(ImL.').';

vdr = []; % the velocity where root occurs
ldr = []; % the eigenvalue where root occurs
indexes = []; % the index where root occurs
directions = [];
nonzeros = [];

% set initial condition
old_nonzero = find(ImL(1,:) ~= 0);
old_count = length(old_nonzero);

% loop through rest of eigenvalues
for i = 2:length(v)
    nonzero = find(ImL(i,:) ~= 0);
    count = length(nonzero);
    if count ~= old_count  % change in count?
        indexes = [indexes; i];
        if count > old_count  % found a new complex conjugate
            vdr = [vdr; v(i)];
            ldr = [ldr; (ReL(i,nonzero(1,1)) + ReL(i,nonzero(1,2)))/2];
            directions = [directions; 0];
            if old_count == 2 % up from 2 to 4, need to find which one
                lost_nonzero = [];
                for j = 1:4
                    if old_nonzero(1) ~= nonzero(j) & old_nonzero(2) ~= nonzero(j)
                        lost_nonzero = [lost_nonzero, nonzero(j)];
                    end
                end
            else %old count == 0
                if count == 4
                    warndlg(sprintf('%s\n%s', 'Not enough data points to find these roots.', ...
                                              'Specify more speed steps and try again.'));
                    return
                else
                    lost_nonzero = nonzero;
                end
            end
            nonzeros = [nonzeros; lost_nonzero];
        elseif count < old_count  % lost a complex conjugate
            if old_count == 4 % down from 4 to 2, need to find which one
                lost_nonzero = [];
                for j = 1:4
                    if old_nonzero(j) ~= nonzero(1) & old_nonzero(j) ~= nonzero(2)
                        lost_nonzero = [lost_nonzero, old_nonzero(j)];
                    end
                end
            else
                lost_nonzero = old_nonzero;
            end
            vdr = [vdr; v(i-1)];
            ldr = [ldr; (ReL(i-1,lost_nonzero(1,1)) + ReL(i-1,lost_nonzero(1,2)))/2];
            directions = [directions; 1];
            nonzeros = [nonzeros; lost_nonzero];
        end
    end
    old_count = count;
    old_nonzero = nonzero;
end
% disp('  Before fine-tuning.')
% disp(sprintf('\t v \t\t\t lambda'))
% for i = 1:length(vdr)
%     disp(sprintf('\t %g \t %g', vdr(i), ldr(i))); % more digits
% end
% loop through roots found and try to fine-tune them
for i = 1:length(indexes)
    if directions(i) == 0 % have to look forward?
        two = 1; % define step sizes and direction to take
        one = 0;
        if indexes(i) >= length(v) % make sure data exists
            warndlg(sprintf('%s\n%s', 'Not enough data points to fine tune these roots.', ...
                                      'Specify more speed steps and try again.'));
            return
        end
    else % have to look back?
        two = -2; % define step sizes and direction to take
        one = -1;
        if indexes(i) <= 2 % make sure data exists
            warndlg(sprintf('%s\n%s', 'Not enough data points to fine tune these roots.', ...
                                      'Specify more speed steps and try again.'));
            return
        end
    end
    % use fact that start of conjugate pair looks quadratic
    xs = [ImL(indexes(i)+two,nonzeros(i,1)), ...
          ImL(indexes(i)+one,nonzeros(i,1)), ...
          ImL(indexes(i)+one,nonzeros(i,2)), ...
          ImL(indexes(i)+two,nonzeros(i,2))];
    ys = [v(indexes(i)+two), ... 
          v(indexes(i)+one), ...
          v(indexes(i)+one), ...
          v(indexes(i)+two)];
    p = polyfit(xs, ys, 2); % find quadratic
    vdr(i) = p(3); % and just grab last coefficient
    % use fact that real part looks linear
    xs = [v(indexes(i)+one), ... 
          v(indexes(i)+two)];
    ys = [ReL(indexes(i)+one,nonzeros(i,1)), ...
          ReL(indexes(i)+two,nonzeros(i,1))];
    p = polyfit(xs, ys, 1); % find linear
    ldr(i) = p(1) * vdr(i) + p(2);
end
if run_verbose == 1
    %disp('  After fine-tuning.')
    disp(sprintf('\t v \t\t\t\t\t\t lambda'))
    for i = 1:length(vdr)
        disp(sprintf('\t %1.16f \t %1.16f', vdr(i), ldr(i))); % more digits
    end
end