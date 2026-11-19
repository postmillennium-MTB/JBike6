%-------------------------------------------
%
% Benchmark Paper
%
% C:\Documents and Settings\CAD\My Documents\Dressel\JBike6\JBike6_2006_09_13\JBini_files\JBini_Benchmark_Paper.m
%
% Weave speed = 4.2924 m\s
%
% Capsize speed = 6.0243 m\s
%
% Units are meters, kilograms, radians, and seconds
%
% gravity = 9.81000000;
% min_vel = 0;
% max_vel = 10;
% vel_steps = 101;

% Note that front fork and basket coordinates are in UV coordinate system.
%
%-------------------------------------------

    name = 'Benchmark Paper';
    comment = sprintf('%s' ...
               ,'Benchmark paper bike. Switch to XY, set alphas to -18.43494882292201° and 8.13010235415599°, and g to 9.81 for max accuracy.' ...
               );

    wheelbase = 1.02000000;
    head_angle = 1.25663706;
    trail = 0.08000000;

    % rear wheel
      Drearwheel = 0.60000000;
      mrearwheel = 2.00000000;
      Irearwheel = [0.06030000 0.06030000 0.12000000];
      alphaIrearwheel = 0.00000000;

    % front wheel
      Dfrontwheel = 0.70000000;
      mfrontwheel = 3.00000000;
      Ifrontwheel = [0.14050000 0.14050000 0.28000000];
      alphaIfrontwheel = 0.00000000;

    % rider
      mrider = 0.00000000;
      xcmrider = 0.00000000;
      ycmrider = 0.00000000;
      Irider = [0.00000000 0.00000000 0.00000000];
      alphaIrider = 0.00000000;

    % frame
      mframe = 85.00000000;
      xcmframe = 0.30000000;
      ycmframe = 0.90000000;
      Iframe = [10.00000000 2.00000000 11.00000000];
      alphaIframe = -0.32175055439664;

    % front fork
      mfork = 4.00000000;
      ucmfork = 0.02610059;
      vcmfork = 0.72754296;
      Ifork = [0.06000000 0.00600000 0.06000000];
      alphaIfork = 0.14189705460416;

    % front basket
      mbasket = 0.00000000;
      ucmbasket = -1.04616217;
      vcmbasket = 0.33991869;
      Ibasket = [0.00000000 0.00000000 0.00000000];
      alphaIbasket = 0.00000000;

    % rear rack
      mrack = 0.00000000;
      xcmrack = 0.00000000;
      ycmrack = 0.00000000;
      Irack = [0.00000000 0.00000000 0.00000000];
      alphaIrack = 0.00000000;

