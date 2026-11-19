%-------------------------------------------
%
% Burley Canto (long)
%
% JBini_Burley_Canto_long.m
%
% Weave speed = 0.0000 meters per second
%
% Capsize speed = 7.5867 meters per second
%
% Units are meters, kilograms, and radians
%
%-------------------------------------------

    gravity = 9.80665000;
    max_vel = 10.00000000;

    name = 'Burley Canto (long)';
    comment = 'Front fork in the forward steering tube as assembled by the bike shop.';

    wheelbase = 1.59000000;
    head_angle = 1.24694900;
    trail = 0.06700000;

    % rear wheel
      Drearwheel = 0.65000000;
      mrearwheel = 2.72730000;
      Irearwheel = [0.11522850 0.11522850 0.23045700];
      alphaIrearwheel = 0.00000000;

    % front wheel
      Dfrontwheel = 0.49500000;
      mfrontwheel = 2.27270000;
      Ifrontwheel = [0.05568700 0.05568700 0.11137400];
      alphaIfrontwheel = 0.00000000;

    % rider
      mrider = 80.00000000;
      xcmrider = 0.50000000;
      ycmrider = 0.75000000;
      Irider = [10.53112900 2.46887100 12.00000000];
      alphaIrider = 1.00000001;

    % frame
      mframe = 12.71370000;
      xcmframe = 0.75000000;
      ycmframe = 0.45000000;
      Iframe = [0.02000000 2.00000000 2.00000000];
      alphaIframe = 0.15000000;

    % front fork
      mfork = 3.00000000;
      ucmfork = -0.30000000;
      vcmfork = 0.49500000;
      Ifork = [0.06125600 0.00061300 0.06125600];
      alphaIfork = 0.32384699;

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

