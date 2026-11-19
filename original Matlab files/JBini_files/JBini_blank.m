%-------------------------------------------
%
% blank
%
% JBini_blank.m
%
% units are meters, kilograms, and radians
%
%-------------------------------------------

    name = 'blank';
    comment = sprintf('%s\n%s\n%s' ...
               ,'Blank bike (all parameters zero).' ...
               ,'Use as a fresh start for a new bike.' ...
               ,'If you do, be sure to change the name.' ...
               );

    wheelbase = 0.000000;
    head_angle = 0.000000;
    trail = 0.000000;

    % rear wheels
      Drearwheel = 0.000000;
      mrearwheel = 0.000000;
      Irearwheel = [0.000000 0.000000 0.000000];
      alphaIrearwheel = 0.000000;

    % front wheels
      Dfrontwheel = 0.000000;
      mfrontwheel = 0.000000;
      Ifrontwheel = [0.000000 0.000000 0.000000];
      alphaIfrontwheel = 0.000000;

    % rider
      mrider = 0.000000;
      xcmrider = 0.000000;
      ycmrider = 0.000000;
      Irider = [0.000000 0.000000 0.000000];
      alphaIrider = 0.000000;

    % frame
      mframe = 0.000000;
      xcmframe = 0.000000;
      ycmframe = 0.000000;
      Iframe = [0.000000 0.000000 0.000000];
      alphaIframe = 0.000000;

    % front fork
      mfork = 0.000000;
      ucmfork = 0.000000;
      vcmfork = 0.000000;
      Ifork = [0.000000 0.000000 0.000000];
      alphaIfork = 0.000000;

    % front basket
      mbasket = 0.000000;
      ucmbasket = 0.000000;
      vcmbasket = 0.000000;
      Ibasket = [0.000000 0.000000 0.000000];
      alphaIbasket = 0.000000;

    % rear rack
      mrack = 0.000000;
      xcmrack = 0.000000;
      ycmrack = 0.000000;
      Irack = [0.000000 0.000000 0.000000];
      alphaIrack = 0.000000;

