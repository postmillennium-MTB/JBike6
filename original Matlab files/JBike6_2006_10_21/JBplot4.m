% JBplot4.m

% Created by Arend L. Schwab and Jim Papadopoulos, 18-Jun-2003
% Copyright © 2003-2006 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University

% This Matlab script plots the eigenvalues from JBeig
% as a function of the forward speed v in four views

% 06/27/03 AED - changed plot parameter from '.' to '.b' because
%                colors look like they mean something when they
%                really don't.
%              - add horizontal lines to show stable region
%              - add (m/s) units to velocity axis label
% 11/06/05 AED - updated date in title
% 11/10/05 AED - rearrange and reorient plots for easier comparison
%              - use vweave and vcapsize calculated by JBvcrit.m
%              - add application name and version to window title
%              - keep name and version in single place: JBini.m
% 11/11/05 AED - optional use styles set by user
%              - rotate 3D plot to match other three
% 12/19/05 AED - more completely apply styles and settings set by user
% 12/20/05 AED - don't use vweave if not defined.
% 09/11/06 AED - Fix copyright on plot

if use_styles_in_plot4 == 1 % need real and imaginary separated
    % there is probably a faster, easier way to do this in
    % MATLAB, but I can't find it...
    % make copies to work on
    real_real_lamb = [];
    imag_real_lamb = [];
    real_imag_lamb = [];
    imag_imag_lamb = [];
    [rows, cols] = size(lambdas);
    for i = 1:rows
        for j = 1:cols
            if abs(real(lambdas(i,j))) < 1e-5 % 'small', near zero
                real_real_lamb(i,j) = NaN; % make it not plot
                imag_real_lamb(i,j) = NaN; % make it not plot
            else
                real_real_lamb(i,j) = real(lambdas(i,j));
                imag_real_lamb(i,j) = imag(lambdas(i,j));
            end
            if abs(imag(lambdas(i,j))) < 1e-5 % 'small', near zero
                real_imag_lamb(i,j) = NaN; % make it not plot
                imag_imag_lamb(i,j) = NaN; % make it not plot
            else
                real_imag_lamb(i,j) = real(lambdas(i,j));
                imag_imag_lamb(i,j) = imag(lambdas(i,j));
            end
        end
    end
    min_imag = min([min(min(imag_real_lamb)) min(min(imag_imag_lamb))]);
    max_imag = max([max(max(imag_real_lamb)) max(max(imag_imag_lamb))]);
    min_real = min([min(min(real_real_lamb)) min(min(real_imag_lamb))]);
    max_real = max([max(max(real_real_lamb)) max(max(real_imag_lamb))]);
end

figure;
set(gcf, 'Name', [app_name, ' ', app_version]);

Relim=[-inf inf];
Imlim=[-inf inf];
vlim=[-inf inf];

%make the plots
h = subplot(2,2,1); % Imaginary vs speed
if use_styles_in_plot4 == 0
    plot(v,imag(lambdas),'.b');
    grid;
else
    plot(v, imag_real_lamb, real_eigen_symbol, ...
         'color', real_eigen_color, ...
         'MarkerSize', real_eigen_size);
    hold on;
    plot(v, imag_imag_lamb, imag_eigen_symbol, ...
         'color', imag_eigen_color, ...
         'MarkerSize', imag_eigen_size); 
    % set background color
    % have to do this after the 'hold on' above
    set(h, 'color', plot_background_color);
    % plot solid black horizontal and vertical axis
    if draw_axis_lines == 1
        plot([min(v) max(v)], [0 0], 'color', axis_color);
        if min(v) <= 0
            plot([0 0], [min_imag max_imag], 'color', axis_color);
        end
    end
    hold off;
    if draw_grid_lines == 1
        grid;
    end
end
axis([vlim Imlim]);
xlabel('v (m/s)');
ylabel('Im(\lambda)');
title(sprintf('Copyright © 2003-2006\nSchwab, Papadopoulos, Ruina, & Dressel'));

h = subplot(2,2,2); % real vs imag
if use_styles_in_plot4 == 0
    plot(lambdas,'.b');
    grid;
else
    plot(real_real_lamb, imag_real_lamb, real_eigen_symbol, ...
         'color', real_eigen_color, ...
         'MarkerSize', real_eigen_size);
    hold on;
    plot(real_imag_lamb, imag_imag_lamb, imag_eigen_symbol, ...
         'color', imag_eigen_color, ...
         'MarkerSize', imag_eigen_size); 
    % set background color
    % have to do this after the 'hold on' above
    set(h, 'color', plot_background_color);
    % plot solid black horizontal and vertical axis
    if draw_axis_lines == 1
        plot([min_real max_real], [0 0], 'color', axis_color);
        plot([0 0], [min_imag max_imag], 'color', axis_color);
    end
    hold off;
    if draw_grid_lines == 1
        grid;
    end
end
axis([Relim Imlim]);
xlabel('Re(\lambda)');
ylabel('Im(\lambda)');
title(name);

h = subplot(2,2,3); % real vs speed
if use_styles_in_plot4 == 0
    plot(v,real(lambdas),'.b');
    grid;
else
    plot(v, real_real_lamb, real_eigen_symbol, ...
         'color', real_eigen_color, ...
         'MarkerSize', real_eigen_size);
    hold on;
    plot(v, real_imag_lamb, imag_eigen_symbol, ...
         'color', imag_eigen_color, ...
         'MarkerSize', imag_eigen_size); 
    % set background color
    % have to do this after the 'hold on' above
    set(h, 'color', plot_background_color);
    % plot solid black horizontal and vertical axis
    if draw_axis_lines == 1
        plot([min(v) max(v)], [0 0], 'color', axis_color);
        if min(v) <= 0
            plot([0 0], [min_real max_real], 'color', axis_color);
        end
    end
    hold off;
    if draw_grid_lines == 1
        grid;
    end
end
axis([Relim vlim]);
xlabel('v (m/s)');
ylabel('Re(\lambda)');
if draw_weave_speed == 1 & draw_capsize_speed == 1
    title(sprintf('v_{stable}: %g--%g m/s',vweave,vcapsize));
end

h = subplot(2,2,4);
if use_styles_in_plot4 == 0
    plot3(v,real(lambdas),imag(lambdas),'.b');
    grid;
else
    plot3(v, real_real_lamb, imag_real_lamb, real_eigen_symbol, ...
         'color', real_eigen_color, ...
         'MarkerSize', real_eigen_size);
    hold on;
    plot3(v, real_imag_lamb, imag_imag_lamb, imag_eigen_symbol, ...
         'color', imag_eigen_color, ...
         'MarkerSize', imag_eigen_size); 
    % set background color
    % have to do this after the 'hold on' above
    set(h, 'color', plot_background_color);
    % plot solid black horizontal and vertical axis
    if draw_axis_lines == 1
        plot3([min(v) max(v)], [0 0], [0 0],'color', axis_color);
        if min(v) <= 0
            plot3([0 0], [min_real max_real], [0 0], 'color', axis_color);
            plot3([0 0], [0 0], [min_imag max_imag], 'color', axis_color);
        end
    end
    hold off;
    if draw_grid_lines == 1
        grid;
    end
end
axis([Relim Imlim vlim]);
xlabel('v (m/s)');
ylabel('Re(\lambda)');
zlabel('Im(\lambda)');
