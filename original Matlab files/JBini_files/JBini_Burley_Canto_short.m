%-------------------------------------------
%
% Burley Canto (short)
%
% JBini_Burley_Canto_short.m
%
% Weave speed = 5.2240 m\s
%
% Capsize speed = 9.4579 m\s
%
% Units are meters, kilograms, radians, and seconds
%
%-------------------------------------------

    gravity = 9.80665000;
    max_vel = 11.00000000;

    name = 'Burley Canto (short)';
    comment = sprintf('%s\n%s' ...
               ,'The front fork has been moved back' ...
               ,'to the rear steering tube.        ' ...
               );

    wheelbase = 1.15500000;
    head_angle = 1.24689999;
    trail = 0.06700000;

    % rear wheel
      Drearwheel = 0.65000000;
      mrearwheel = 2.72730000;
      Irearwheel = [0.11523000 0.11523000 0.23046000];
      alphaIrearwheel = 0.00000000;

    % front wheel
      Dfrontwheel = 0.49500000;
      mfrontwheel = 2.27270000;
      Ifrontwheel = [0.05568500 0.05568500 0.11137000];
      alphaIfrontwheel = 0.00000000;

    % rider
      mrider = 80.00000000;
      xcmrider = 0.40000000;
      ycmrider = 0.75000000;
      Irider = [8.00000000 2.46890000 10.00000000];
      alphaIrider = 1.00000001;

    % frame
      mframe = 12.71370000;
      xcmframe = 0.75000000;
      ycmframe = 0.45000000;
      Iframe = [0.02000000 2.00000000 2.00000000];
      alphaIframe = 0.15000000;

    % front fork
      mfork = 3.00000000;
      ucmfork = 0.00000000;
      vcmfork = 0.49500000;
      Ifork = [0.06125600 0.00061300 0.06125600];
      alphaIfork = 0.32385000;

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

