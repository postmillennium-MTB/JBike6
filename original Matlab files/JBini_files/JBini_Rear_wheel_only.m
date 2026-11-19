%-------------------------------------------
%
% Rear wheel only
%
% C:\Documents and Settings\CAD\My Documents\Dressel\JBike6\JBike6_2006_10_10\JBini_files\JBini_Rear_wheel_only.m
%
% Weave speed = NaN m\s
%
% Capsize speed = NaN m\s
%
% Units are meters, kilograms, radians, and seconds
%
% gravity = 9.80665000;
% min_vel = 0;
% max_vel = 6;
% vel_steps = 101;

% Note that front fork and basket coordinates are in UV coordinate system.
%
%-------------------------------------------

    name = 'Rear wheel only';
    comment = 'The original JBike6 set of parameters.';

    wheelbase = 1.01600000;
    head_angle = 1.23879599;
    trail = 0.09096800;

    % rear wheel
      Drearwheel = 0.68580000;
      mrearwheel = 1.81818200;
      Irearwheel = [0.08551300 0.08551300 0.17102600];
      alphaIrearwheel = 0.00000000;

    % front wheel
      Dfrontwheel = 0.68580000;
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
      mframe = 0.00000000;
      xcmframe = 0.00000000;
      ycmframe = 0.00000000;
      Iframe = [0.00000000 0.00000000 0.00000000];
      alphaIframe = 0.00000000;

    % front fork
      mfork = 0.00000000;
      ucmfork = 0.00000000;
      vcmfork = 0.00000000;
      Ifork = [0.00000000 0.00000000 0.00000000];
      alphaIfork = 0.00000000;

    % front basket
      mbasket = 0.00000000;
      ucmbasket = 0.00000000;
      vcmbasket = 0.00000000;
      Ibasket = [0.00000000 0.00000000 0.00000000];
      alphaIbasket = 0.00000000;

    % rear rack
      mrack = 0.00000000;
      xcmrack = 0.00000000;
      ycmrack = 0.00000000;
      Irack = [0.00000000 0.00000000 0.00000000];
      alphaIrack = 0.00000000;

