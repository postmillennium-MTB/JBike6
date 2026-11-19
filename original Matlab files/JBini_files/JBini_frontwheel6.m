%-------------------------------------------
%
% frontwheel6
%
% JBini_frontwheel6.m
%
% Capsize speed = 1.1072 meters per second
%
% Units are meters, kilograms, and radians
%
%-------------------------------------------

    gravity = 9.80665000;
    max_vel = 10.00000000;

    name = 'frontwheel6';
    comment = 'wheel with large mass. Trail and wheelbase and head angle irrel, no rear inertia';

    wheelbase = 2.00000000;
    head_angle = 1.57079633;
    trail = 0.00000000;

    % rear wheel
      Drearwheel = 0.01000000;
      mrearwheel = 0.00000000;
      Irearwheel = [0.00000000 0.00000000 0.00000000];
      alphaIrearwheel = 0.00000000;

    % front wheel
      Dfrontwheel = 0.50000000;
      mfrontwheel = 1.60000000;
      Ifrontwheel = [0.05000000 0.05000000 0.10000000];
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
      mbasket = 0.50000000;
      ucmbasket = 0.05000000;
      vcmbasket = 0.30000000;
      Ibasket = [0.00000000 0.00000000 0.00000000];
      alphaIbasket = 0.00000000;

    % rear rack
      mrack = 0.00000000;
      xcmrack = 0.00000000;
      ycmrack = 0.00000000;
      Irack = [0.00000000 0.00000000 0.00000000];
      alphaIrack = 0.00000000;

