%-------------------------------------------
%
% Trail only
%
% C:\Documents and Settings\CAD\My Documents\Dressel\JBike6\JBike6_2006_09_12\JBini_files\JBini_Trail_only.m
%
% Weave speed = 3.1190 m\s
%
% Capsize speed = NaN m\s
%
% Units are meters, kilograms, radians, and seconds
%
% gravity = 9.80665000;
% min_vel = 0;
% max_vel = 10;
% vel_steps = 101;

% Note that front fork and basket coordinates are in UV coordinate system.
%
%-------------------------------------------

    name = 'Trail only';
    comment = 'Stable due to trail. Front mass on steer axis. Note rear rack mass used to keep rear on ground -- no effect on stability ';

    wheelbase = 2.00000000;
    head_angle = 1.48352986;
    trail = 0.06900000;

    % rear wheel
      Drearwheel = 1.00000000;
      mrearwheel = 0.00000000;
      Irearwheel = [0.00000000 0.00000000 0.00000000];
      alphaIrearwheel = 0.00000000;

    % front wheel
      Dfrontwheel = 1.00000000;
      mfrontwheel = 0.00000000;
      Ifrontwheel = [0.00000000 0.00000000 0.00000000];
      alphaIfrontwheel = 0.00000000;

    % rider
      mrider = 0.00000000;
      xcmrider = 0.00000000;
      ycmrider = 0.00000000;
      Irider = [0.00000000 0.00000000 0.00000000];
      alphaIrider = 0.00000000;

    % frame
      mframe = 40.00000000;
      xcmframe = 2.50000000;
      ycmframe = 1.00000000;
      Iframe = [0.00000000 0.00000000 0.00000000];
      alphaIframe = 0.00000000;

    % front fork
      mfork = 0.00000000;
      ucmfork = 0.00000000;
      vcmfork = 0.00000000;
      Ifork = [0.00000000 0.00000000 0.00000000];
      alphaIfork = 0.00000000;

    % front basket
      mbasket = 1.00000000;
      ucmbasket = 0.00000000;
      vcmbasket = 0.50000000;
      Ibasket = [0.00000000 0.00000000 0.00000000];
      alphaIbasket = 0.00000000;

    % rear rack
      mrack = 40.00000000;
      xcmrack = 0.00000000;
      ycmrack = 0.00000000;
      Irack = [0.00000000 0.00000000 0.00000000];
      alphaIrack = 0.00000000;

