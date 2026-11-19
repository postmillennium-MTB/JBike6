%-------------------------------------------
%
% Backwards Bike
%
% JBini_Backwards_Bike.m
%
% Weave speed = NaN m\s
%
% Capsize speed = NaN m\s
%
% Units are meters, kilograms, radians, and seconds
%
% gravity = 9.80665000;
% min_vel = -10;
% max_vel = 0;
% vel_steps = 101;

% Note that front fork and basket coordinates are in UV coordinate system.
%
%-------------------------------------------

    name = 'Backwards Bike';
    comment = 'The original JBike6 set of parameters, but in reverse.';

    wheelbase = -1.01600000;
    head_angle = 1.91986218;
    trail = -0.09096800;

    % rear wheel
      Drearwheel = 0.68580000;
      mrearwheel = 1.81818200;
      Irearwheel = [0.08551300 0.08551300 0.17102600];
      alphaIrearwheel = 0.00000000;

    % front wheel
      Dfrontwheel = 0.68580000;
      mfrontwheel = 1.81818200;
      Ifrontwheel = [0.08551300 0.08551300 0.17102600];
      alphaIfrontwheel = 0.00000000;

    % rider
      mrider = 80.00000000;
      xcmrider = -0.30000000;
      ycmrider = 1.20000000;
      Irider = [10.53112900 2.46887100 12.00000000];
      alphaIrider = 0.25957299;

    % frame
      mframe = 2.50000000;
      xcmframe = -0.30000000;
      ycmframe = 0.50000000;
      Iframe = [0.05857900 0.34142100 0.40000000];
      alphaIframe = -0.39269899;

    % front fork
      mfork = 1.50000000;
      ucmfork = 0.00000000;
      vcmfork = 0.68580000;
      Ifork = [0.05879000 0.00058800 0.05879000];
      alphaIfork = -0.33200000;

    % front basket
      mbasket = 1.50000000;
      ucmbasket = -0.15000000;
      vcmbasket = 0.80000000;
      Ibasket = [0.01000000 0.01000000 0.01000000];
      alphaIbasket = 0.00000000;

    % rear rack
      mrack = 2.00000000;
      xcmrack = 0.10000000;
      ycmrack = 0.80000000;
      Irack = [0.02000000 0.02000000 0.02000000];
      alphaIrack = 0.00000000;

