%-------------------------------------------
% 
% JBike6 March 12, 2006
% 
% Configuration file (read after JBini.m)
% 
% Contains all settings made by user in GUI
% 
% Read after JBini.m and overrides it
% 
%-------------------------------------------
bike_name = 'Schwinn Crown';
gravity = 9.80665000;
min_vel = 0;
max_vel = 10;
vel_steps = 101;

angle_units = 2;
XY_UV = 1;
work_dir = 'JBini_files';
double_root_method = 1;
run_verbose = 1;

draw_coord_axes = 1;
draw_axis_lines = 1;
draw_grid_lines = 1;
draw_legend = 1;
draw_additional_plots = 0;
draw_root_lines = 1;
draw_weave_speed = 1;
draw_capsize_speed = 1;
draw_imaginary_parts = 1;

weave_speed_color = [0 1 0];
capsize_speed_color = [1 0 0];
double_root_speed_color = [1 0 1];
real_eigen_color = [0 0 1];
imag_eigen_color = [0 1 1];
axis_color = [0 0 0];
plot_background_color = [1 1 1];

real_eigen_symbol = '.';
imag_eigen_symbol = '.';
weave_speed_line_type = '-';
capsize_speed_line_type = '-';
double_root_speeds_line_type = '-';

real_eigen_size = 5;
imag_eigen_size = 5;
weave_speed_size = 1;
capsize_speed_size = 1;
double_root_speeds_size = 1;
