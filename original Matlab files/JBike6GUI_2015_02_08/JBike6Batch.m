% Created by Andrew Dressel, 10-9-2003
% Copyright © 2003-2006 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University

% Modification History
% 12/23/05 AED - Updated to work with most recent JBike6
% 09/21/06 AED - Generalize to make easier to switch parameters

%-----------------------------------------------------------
% JBike6Batch
%
% to run:
%   1 - specify JBini_ file to load
%   2 - specify which parameters to vary
%   3 - specify number of steps to take along each axis
%   4 - optionally set maximum speed to plot
%   5 - optionally adjust minumum parameter values
%
% See on-line help (JBhelp.htm) for more details
%-----------------------------------------------------------

clear all; clc;

%-----------------------------------------------------------
% 'read in' all the constants and parameters
%-----------------------------------------------------------
JBini;
run('JBini_files\JBini_Schwinn_Crown');
%run('JBini_files\JBini_TAM_674_Final_Project');
%run('JBini_files\JBini_Litespeed_Ultimate');
%run('JBini_files\JBini_Burley_Canto_long');

%-----------------------------------------------------------
% specify which parameters to vary
%-----------------------------------------------------------
trial = 1
switch trial
    case 1
        v1_name = 'trail'; v1_unit = 'meters';
        v2_name = 'head_angle'; v2_unit = 'radians';
        v3_name = 'wheelbase'; v3_unit = 'meters';
    case 2
        v1_name = 'mrack'; v1_unit = 'kgs';
        v2_name = 'xcmrack'; v2_unit = 'meters';
        v3_name = 'ycmrack'; v3_unit = 'meters';
    case 3
        v1_name = 'mbasket'; v1_unit = 'kgs';
        v2_name = 'ucmbasket'; v2_unit = 'meters';
        v3_name = 'vcmbasket'; v3_unit = 'meters';
    case 4
        v1_name = 'mbasket'; v1_unit = 'kgs';
        v2_name = 'mrack'; v2_unit = 'kgs';
        v3_name = 'wheelbase'; v3_unit = 'meters';
    case 5
        v1_name = 'Irack(1)'; v1_unit = 'meters';
        v2_name = 'Irack(2)'; v2_unit = 'meters';
        v3_name = 'Irack(3)'; v3_unit = 'meters';
end

% echo to command line for confirmation
eval(['v1 = ' v1_name ';']);
eval(['v2 = ' v2_name ';']);
eval(['v3 = ' v3_name ';']);

%-----------------------------------------------------------
% number of data points along axis (odd numbers work best)
%-----------------------------------------------------------
steps = 9; % minimum 3, and small number are faster
v1_steps = steps; %minimum 3
v2_steps = steps; %minimum 3
v3_steps = steps; %minimum 3

%-----------------------------------------------------------
% speed cap
%-----------------------------------------------------------
max_v = 15; %just for plotting

%-----------------------------------------------------------
% minimum value from which to start stepping
%-----------------------------------------------------------
min_v1 = v1 - v1 * 0.1;
min_v2  = v2 - v2 * 0.1;
min_v3 = v3 - v3 * 0.1;

%-----------------------------------------------------------
% shouldn't need to change anything below this line
%-----------------------------------------------------------

%-----------------------------------------------------------
% echo bike parameters read from ini file
%-----------------------------------------------------------
disp(sprintf('Bike name = %s', name ));
disp(sprintf('  %s = %f %s', v1_name, v1, v1_unit));
disp(sprintf('  %s = %f %s', v2_name, v2, v2_unit));
disp(sprintf('  %s = %f %s', v3_name, v3, v3_unit));

%-----------------------------------------------------------
% get 'standard' eigenvalues and critical values for 1st plot
%-----------------------------------------------------------
% calculate the linearized equations of motion
JBmck
    
% calculate the weave and capsize speed
JBvcrit

% calculate the igenvalues and eigenvectors for a speed range
JBeig

h = figure;
set(h, 'NumberTitle', 'off', 'Name', sprintf('JBike6: ', name));

h = subplot(2,2,1);
JBrev
title(sprintf('%s with stock parameters', name));

%-----------------------------------------------------------
% save originals
%-----------------------------------------------------------
save_v1 = v1;
save_v2 = v2;
save_v3 = v3;

%-----------------------------------------------------------
%initialize arrays and matrixes to hold results for best performance
%-----------------------------------------------------------
v1 = zeros(v1_steps, 1);
v2 = zeros(v2_steps, 1);
v3 = zeros(v3_steps, 1);

v1_v_v2_vweave = zeros(v2_steps, v1_steps);
v1_v_v2_vcapsize = zeros(v2_steps, v1_steps);

v1_v_v3_vweave = zeros(v3_steps, v1_steps);
v1_v_v3_vcapsize = zeros(v3_steps, v1_steps);

v2_v_v3_vweave = zeros(v3_steps, v2_steps);
v2_v_v3_vcapsize = zeros(v3_steps, v2_steps);

%-----------------------------------------------------------
%ask everyone to keep quiet (to improve performance)
%-----------------------------------------------------------
run_verbose = 0;              % 1 = yes, 0 = no

%-----------------------------------------------------------
%step through all values
%-----------------------------------------------------------
tic         %start the clock
steps = 0;
for v1_i = 1: v1_steps,
    eval([v1_name ' = min_v1 + 2 * v1_i * (save_v1-min_v1) / (1 + v1_steps);']);
    disp(sprintf('v1 %d of %d', v1_i, v1_steps))
    eval(['v1(v1_i, :) = ' v1_name ';']);
    for v2_i = 1: v2_steps, 
        eval([v2_name ' = min_v2 + 2 * v2_i * (save_v2-min_v2) / (1 + v2_steps);']);
        disp(sprintf(' v2 %d of %d', v2_i, v2_steps))
        eval(['v2(v2_i, :) = ' v2_name ';']);
        for v3_i = 1: v3_steps,
            eval([v3_name ' = min_v3 + 2 * v3_i * (save_v3-min_v3) / (1 + v3_steps);']);
            disp(sprintf('  v3 %d of %d', v3_i, v3_steps))
            eval(['v3(v3_i, :) = ' v3_name ';']);
            
            %-----------------------------------------------------------
            % calculate the linearized equations of motion
            %-----------------------------------------------------------
			JBmck;
            
            %-----------------------------------------------------------
	        % calculate the weave and capsize speeds
            %-----------------------------------------------------------
			JBvcrit; 
            
            steps = steps + 1;
            
            %-----------------------------------------------------------
            % suppress these for better looking plots
            %-----------------------------------------------------------
            if vweave > max_v
                vweave = NaN;
            end
            if vcapsize > max_v
                vcapsize = NaN;
            end
            
            %-----------------------------------------------------------
            % store everything away
            %-----------------------------------------------------------
            if v1_i == round(v1_steps/2)
				v2_v_v3_vweave(v3_i, v2_i) = vweave;
				v2_v_v3_vcapsize(v3_i, v2_i) = vcapsize;
            end
            
            if v2_i == round(v2_steps/2)
                v1_v_v3_vweave(v3_i, v1_i) = vweave;
				v1_v_v3_vcapsize(v3_i, v1_i) = vcapsize;
            end
			
            if v3_i == round(v3_steps/2)
				v1_v_v2_vweave(v2_i, v1_i) = vweave;
				v1_v_v2_vcapsize(v2_i, v1_i) = vcapsize;
            end
        end
    end
end

%-----------------------------------------------------------
% report statistics from run
%-----------------------------------------------------------
act_time = toc; %stop the clock
disp(sprintf('  %.0f steps', steps));
if act_time < 120
   disp(sprintf('  %.0f seconds', act_time));
elseif act_time < 7200
   disp(sprintf('  %.0f seconds (%.2f minutes)', act_time, act_time/60));
else
   disp(sprintf('  %.0f seconds (%.2f hours)', act_time, act_time/3600));
end
disp(sprintf('  %.2f steps per second', steps/act_time));

%-----------------------------------------------------------
% clean up names
%-----------------------------------------------------------
v1_name = regexprep(v1_name, '_', ' ');
if strcmp(v1_unit, 'radians')
    v1 = v1*180/pi;
    v1_unit = 'degrees';
end
v2_name = regexprep(v2_name, '_', ' ');
if strcmp(v2_unit, 'radians')
    v2 = v2*180/pi;
    v2_unit = 'degrees';
end
v3_name = regexprep(v3_name, '_', ' ');
if strcmp(v3_unit, 'radians')
    v3 = v3*180/pi;
    v3_unit = 'degrees';
end
%-----------------------------------------------------------
% plot results
%-----------------------------------------------------------
h = subplot(2,2,2);
mesh(v1, v2, v1_v_v2_vweave); hold on;
surf(v1, v2, v1_v_v2_vcapsize); hold off; 
xlabel(sprintf('%s (%s)', v1_name, v1_unit));
ylabel(sprintf('%s (%s)', v2_name, v2_unit)); zlabel('speed');
title(sprintf('%s (%.2f ± %.2f %s) vs\n%s (%.2f ± %.2f %s) at\n%s = %.2f %s', ...
              v1_name, save_v1, save_v1 - v1(1, :), v1_unit, ...
              v2_name, save_v2, save_v2 - v2(1, :), v2_unit, ...
              v3_name, save_v3, v3_unit));

h = subplot(2,2,3);
mesh(v1, v3, v1_v_v3_vweave); hold on; 
surf(v1, v3, v1_v_v3_vcapsize); hold off; 
xlabel(sprintf('%s (%s)', v1_name, v1_unit));
ylabel(sprintf('%s (%s)', v3_name, v3_unit)); zlabel('speed');
title(sprintf('%s (%.2f ± %.2f %s) vs\n%s (%.2f ± %.2f %s) at\n%s = %.2f %s', ...
              v1_name, save_v1, save_v1 - v1(1, :), v1_unit, ...
              v3_name, save_v3, save_v3 - v2(1, :), v3_unit, ...
              v2_name, save_v2, v2_unit));

h = subplot(2,2,4);
mesh(v2, v3, v2_v_v3_vweave); hold on; 
surf(v2, v3, v2_v_v3_vcapsize); hold off; 
xlabel(sprintf('%s (%s)', v2_name, v2_unit));
ylabel(sprintf('%s (%s)', v3_name, v3_unit)); zlabel('speed');
title(sprintf('%s (%.2f ± %.2f %s) vs\n%s (%.2f ± %.2f %s) at\n%s = %.2f %s', ...
              v2_name, save_v2, save_v2 - v2(1, :), v2_unit, ...
              v3_name, save_v3, save_v3 - v2(1, :), v3_unit, ...
              v1_name, save_v1, v1_unit));

%-----------------------------------------------------------
% save the results so they can be plotted again later
%-----------------------------------------------------------
%strrep(name,' ', '_'); %replace blanks with underscores
%save(sprintf('JBike6Trekwithlittlewheels_%s_%d', name, v1_steps)); %save
%data