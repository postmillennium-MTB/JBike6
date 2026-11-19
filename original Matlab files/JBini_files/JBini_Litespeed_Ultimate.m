%-------------------------------------------
%
% Litespeed Ultimate
%
% JBini_Litespeed_Ultimate.m
%
% Weave speed = 4.8539 meters per second
%
% Capsize speed = 7.0994 meters per second
%
% Units are meters, kilograms, and radians
%
%-------------------------------------------

    gravity = 9.80665000;
    max_vel = 10.00000000;

    name = 'Litespeed Ultimate';
    comment = 'No comment.';

    wheelbase = 1.08000000;
    head_angle = 1.27409035;
    trail = 0.06000000;

    % rear wheel
      Drearwheel = 0.68000000;
      mrearwheel = 1.81818200;
      Irearwheel = [0.08407250 0.08407250 0.16814500];
      alphaIrearwheel = 0.00000000;

    % front wheel
      Dfrontwheel = 0.68580000;
      mfrontwheel = 1.36363600;
      Ifrontwheel = [0.06413500 0.06413500 0.12827000];
      alphaIfrontwheel = 0.00000000;

    % rider
      mrider = 80.00000000;
      xcmrider = 0.30000000;
      ycmrider = 1.20000000;
      Irider = [10.53112900 2.46887100 12.00000000];
      alphaIrider = -0.25957299;

    % frame
      mframe = 4.54545500;
      xcmframe = 0.30000000;
      ycmframe = 0.50000000;
      Iframe = [0.05857900 0.34142100 0.40000000];
      alphaIframe = 0.39269899;

    % front fork
      mfork = 1.81818200;
      ucmfork = 0.00000000;
      vcmfork = 0.68580000;
      Ifork = [0.07126100 0.00071300 0.07126100];
      alphaIfork = 0.29670601;

    % front basket
      mbasket = 0.00000000;
      ucmbasket = 0.15000000;
      vcmbasket = 0.80000000;
      Ibasket = [0.01000000 0.01000000 0.01000000];
      alphaIbasket = 0.00000000;

    % rear rack
      mrack = 0.00000000;
      xcmrack = -0.10000000;
      ycmrack = 0.80000000;
      Irack = [0.02000000 0.02000000 0.02000000];
      alphaIrack = 0.00000000;

