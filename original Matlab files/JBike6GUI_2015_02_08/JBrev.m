% JBrev.m
% Plot in a new figure the real part of the eigenvalues lamb
% a function of the forward speed v
% Just like sharp's stability diagram, 1971 but in si units

% Created by Arend L. Schwab and Jim Papadopoulos, 18-Jun-2003
% Delft University of Technology & Cornell University.

% Modification History
% 6/27/03 AED - changed plot parameter from '.' to '.b' because
%               colors look like they mean something when they
%               really don't.
%             - add horizontal lines to show stable region
% 5/8/04 Arend Schwab - add vertical lines for the bifurcation speeds 
% 11/01/05 AED - add yellow vertical lines to show roots
% 11/03/05 AED - Use green for weave speed: onset of stability
% 11/07/07 AED - only draw vertical axis if speed goes to 0 or below
%              - set xlim([min(speed) max(speed)])
%              - set ylim to handle negative speeds better
% 11/08/05 Arend Schwab - added frequency of the weave motion as cyan dots
% 11/10/05 AED - moved colors and dot sizes to JBini.m
% 11/11/05 AED - use user-defined colors, size, and types
% 11/14/05 AED - label colors or symbols better for real and imaginary
% 11/15/05 AED - add optional legend to eigenvalue plot
% 09/21/06 AED - better control limits and drawing of speed lines
% 10/11/06 AED - Add shading of stable regions

% sort the lambdas
lambdas=sort(lamb,2);
ReL=real(lambdas);
ImL=imag(lambdas);
sReL=sort(ReL.').';
sImL=sort(ImL.').';
% only plot freq>0
%ind=(sImL<=0);
ind=(sImL==0);
sImL(ind)=NaN;
speed=v;
vmax = max(v);
% find the stable region (old way)
% Remax=max(real(lambdas),[],2);
% Renul=find(Remax<=1e-5);
% vmin=v(min(Renul));
% vmax=v(max(Renul));

%figure; %let GUI decide where

hs = [];
strs = {};
strn = 0;

% shade stable region (first so under everything else)
hsr = []; % init to empty
if shade_stable_region == 1
    if vweave > min(speed) & vweave < max(speed)
        if  vcapsize > max(speed) | isnan(vcapsize)
            hsr = fill([vweave vweave vmax vmax], ...
                     [-vmax vmax vmax -vmax], stable_region_shade_color);
        elseif vcapsize > min(speed)
            hsr = fill([vweave vweave vcapsize vcapsize], ...
                     [-vmax vmax vmax -vmax], stable_region_shade_color);
        end
        hold on; % plenty more to draw
    end    
end

% draw real parts of eigenvalues
h = plot(speed, sReL, real_eigen_symbol, ...
     'color', real_eigen_color, ...
     'MarkerSize', real_eigen_size);
hs = [hs, h(1)];
strn = strn + 1;
strs(strn) = {'Re(\lambda)'};

hold on; % plenty more to draw
 
% set background color
% have to do this after the 'hold on' above
if ~exist('axes_eig') % if not set for us (if called by JBike6.m)
    axes_eig = gcf; % do it ourselves.
end
set(axes_eig, 'color', plot_background_color);

% draw imaginary parts of eigenvalues
if draw_imaginary_parts
    h = plot(speed, sImL, imag_eigen_symbol, ...
         'color', imag_eigen_color, ...
         'MarkerSize', imag_eigen_size); 
    hs = [hs, h(1)];
    strn = strn + 1;
    strs(strn) = {'Im(\lambda)'};
end

yl = ylim;

% plot solid black horizontal and vertical axis
if draw_axis_lines == 1
    plot([min_vel max_vel], [0 0], 'color', axis_color);
    if min(speed) <= 0
        plot([0 0], [min(yl) max(yl)], 'color', axis_color);
    end
end

% draw weave speed indicator line
if draw_weave_speed == 1
    if vweave > min(speed) & vweave < max(speed)
        h = plot([vweave vweave], [min(yl) -min(yl)], weave_speed_line_type, ...
             'color', weave_speed_color, ...
             'LineWidth', weave_speed_size);
        hs = [hs, h];
        strn = strn + 1;
        strs(strn) = {'weave speed'};
    end
end

% draw capsize speed indicator line
if draw_capsize_speed == 1
    if vcapsize > min(speed) & vcapsize < max(speed)
        h = plot([vcapsize vcapsize], [min(yl) -min(yl)], capsize_speed_line_type, ...
             'color', capsize_speed_color, ...
             'LineWidth', capsize_speed_size); 
        hs = [hs, h];
        strn = strn + 1;
        strs(strn) = {'capsize speed'};
    end
end


% plot vertical lines for at the bifurcation speeds
% this is where we have double roots
if exist('vdr')
    for k=1:length(vdr)
        if vdr(k) > min(speed) & vdr(k) < max(speed)
            h = plot([vdr(k) vdr(k)], [0 ldr(k)], double_root_speeds_line_type, ...
                 'color', double_root_speed_color, ...
                 'LineWidth', double_root_speeds_size);
        end
    end
    if length(vdr) > 0
        hs = [hs, h];
        strn = strn + 1;
        strs(strn) = {'double root'};
    end
end

% add stable region fill to legend
if length(hsr) > 0
    hs = [hs, hsr];
    strn = strn + 1;
    strs(strn) = {'stable region'};
end

% Set the plot limits
% xl = xlim;
% ylim([-xl(2) xl(2)]);
% above croaks on negative ranges, better go with below
xl = max(abs(xlim)); % see what MATLAB defaults to so far
if max(sReL(1,:)) > xl %check to see if all initial values will show
    xl = max(sReL(1,:)) * 1.2; % if not, adjust so that they will
end
ylim([-xl xl]);
xlim([min(speed) max(speed)]);

% draw grid lines if requested to
if draw_grid_lines == 1
    grid;
end
hold off;

xlabel('forward speed - m/s');
if ~exist('ylabel_str') % in case called by JBike6 and this isn't set.
    if draw_imaginary_parts
        ylabel_str = sprintf('Re(\\lambda) and Im(\\lambda) - 1/s\nStable <-> Unstable');
    else
        ylabel_str = sprintf('Re(\\lambda) - 1/s\nStable <-> Unstable');
    end
end
ylabel(ylabel_str);

%logo='Delft University of Technology & Cornell University, 2003';
%title(sprintf('%s\n%s stable:%g--%g m/s',logo,pname,vmin,vmax)); %don't need in GUI
%title(sprintf('stable speeds:%g--%g m/s',vmin,vmax));  %don't need in GUI
if draw_legend == 1
    legend(hs, strs);
end
%legend('boxoff');
