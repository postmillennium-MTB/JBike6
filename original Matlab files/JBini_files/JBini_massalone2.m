%-------------------------------------------
%
% massalone2
%
% JBini_massalone2.m
%
% There is no weave speed
%
% Capsize speed is infinite
%
% Units are meters, kilograms, and radians
%
%-------------------------------------------

    gravity = 9.80665000;
    max_vel = 10.00000000;

    name = 'massalone2';
    comment = sprintf('%s\n%s\n%s\n%s\n%s' ...
               ,'clearly stable                                                            ' ...
               ,'                                                                          ' ...
               ,'Note rear rack mass used to keep rear on ground -- no effect on stability ' ...
               ,'                                                                          ' ...
               ,'Oscillatory at all speeds?                                                ' ...
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
      ycmframe = 1.00000000;
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

