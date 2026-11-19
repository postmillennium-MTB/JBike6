%-------------------------------------------
%
% TAM 674 Final Project
%
% JBini_TAM_674_Final_Project.m
%
% Weave speed = 4.0661 meters per second
%
% Capsize speed = 7.8563 meters per second
%
% Units are meters, kilograms, and radians
%
%-------------------------------------------

    gravity = 9.80665000;
    max_vel = 10.00000000;

    name = 'TAM 674 Final Project';
    comment = 'Parameters for bike and rider provided in the project assignment.';

    wheelbase = 1.20000000;
    head_angle = 1.19028999;
    trail = 0.06000000;

    % rear wheel
      Drearwheel = 0.70000000;
      mrearwheel = 2.00000000;
      Irearwheel = [0.12000000 0.12000000 0.24000000];
      alphaIrearwheel = 0.00000000;

    % front wheel
      Dfrontwheel = 0.70000000;
      mfrontwheel = 2.00000000;
      Ifrontwheel = [0.12000000 0.12000000 0.24000000];
      alphaIfrontwheel = 0.00000000;

    % rider
      mrider = 0.00000000;
      xcmrider = 0.00000000;
      ycmrider = 0.00000000;
      Irider = [0.00000000 0.00000000 0.00000000];
      alphaIrider = 0.00000000;

    % frame
      mframe = 96.00000000;
      xcmframe = 0.55000000;
      ycmframe = 0.50000000;
      Iframe = [16.80000000 5.20000000 24.00000000];
      alphaIframe = 0.00000000;

    % front fork
      mfork = 1.00000000;
      ucmfork = 0.00000000;
      vcmfork = 0.70000000;
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

