%-------------------------------------------
%
% massalone3
%
% JBini_massalone3.m
%
% Capsize speed = 110395531.6460 meters per second
%
% Units are meters, kilograms, and radians
%
%-------------------------------------------

    name = 'massalone3';
    comment = sprintf('%s\n%s\n%s' ...
               ,'diff from massalone2, higher rearframe mass      note y=1.1 is qualitatively different from y=1.3                                                                                ' ...
               ,'                                                                                                                                                                                 ' ...
               ,'                                                                                                                                                                                 ' ...
               );

    wheelbase = 2.00000000;
    head_angle = 1.48352986;
    trail = 0.00000000;

    % rear wheel
      Drearwheel = 0.01000000;
      mrearwheel = 0.00000000;
      Irearwheel = [0.00000000 0.00000000 0.00000000];
      alphaIrearwheel = 0.00000000;

    % front wheel
      Dfrontwheel = 0.01000000;
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
      ycmframe = 1.30000000;
      Iframe = [0.00000000 0.00000000 0.00000000];
      alphaIframe = -0.78539816;

    % front fork
      mfork = 0.00000000;
      ucmfork = 0.00000000;
      vcmfork = 0.00000000;
      Ifork = [0.00000000 0.00000000 0.00000000];
      alphaIfork = 0.00000000;

    % front basket
      mbasket = 1.00000000;
      ucmbasket = 0.05000000;
      vcmbasket = 0.50000000;
      Ibasket = [0.00000000 0.00000000 0.00000000];
      alphaIbasket = 0.00000000;

    % rear rack
      mrack = 40.00000000;
      xcmrack = 0.00000000;
      ycmrack = 0.00000000;
      Irack = [0.00000000 0.00000000 0.00000000];
      alphaIrack = 0.00000000;

