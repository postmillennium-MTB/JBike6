% Created by Andy Ruina, 10-21-2006
% Copyright © 2003-2006 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University

% Modification History

%-----------------------------------------------------------
% JBike6Integrate
%
% to run:
%   1 - specify JBini_ file to load
%   2 - specify forward speed
%   3 - specify initial conditions
%   4 - specify time steps
%   5 - specify integration tolerance
%
% See on-line help (JBhelp.htm) for more details
%-----------------------------------------------------------

function JBike6Integrate

    %-----------------------------------------------------------
    % set up for integration
    %-----------------------------------------------------------

    % 'read in' all the constants, parameters, and JBike6 user settings
    JBini
    JBconfig

    % load all bike specific parameters
    run 'JBini_files/JBini_Iverson_Yellow_Grand_Sport'
    %run 'JBini_files/JBini_Scooter_with_positive_trail'

    % specify forward speed
    forward_speed = 6.3773; % (m/s)

    % specify initial conditions
    phi0 = 0;      % initial lean angle (rad)
    delta0 = 0.1;  % initial steer angle (rad)
    phidot0 = 0;   % initial lean rate (rad/s)
    deltadot0 = 0; % initial steer rate (rad/s)

    %specify time steps
    tspan = [0 10];

    % specify integration tolerance
    error = 1e-3;

    %-----------------------------------------------------------
    % perform integration
    %-----------------------------------------------------------
    
    % package initial conditions for integration
    q0 = [phi0; delta0];
    qdot0 = [phidot0; deltadot0];
    z0 = [q0; qdot0];

    % assemble matrices based on bike parameters
    JBmck

    % set specified integration tolerance
    options = odeset('reltol',error,'abstol',error);

    % integrate
    [t z] = ode45(@bikerhs, tspan, z0, options, forward_speed, K0, K2, C1, M0);

    % extract results
    phi = z(:,1);
    delta = z(:,2);
    phidot = z(:,3);
    deltadot = z(:,4);

    %-----------------------------------------------------------
    % plot results
    %-----------------------------------------------------------

    % create new window and set name
    figure
    set(gcf, 'Name', [app_name, ' ', app_version]);

    % plot lean and steer angles vs time
    subplot(2,2,1)
    plot(t, phi, t, delta); grid on;
    xlabel('time (s)'); ylabel('lean and steer angles (rad)');
    title(sprintf('initial lean = %1.4g, steer = %1.4g,\nlean rate = %1.4g, steer rate = %1.4g', ...
                  phi0, delta0, phidot0, deltadot0));
    legend('lean','steer')

    % plot lean and steer rates vs time
    subplot(2,2,3)
    plot(t, phidot, t, deltadot); grid on;
    xlabel('time (s)'); ylabel('lean and steer rates (rad/s)');
    title(sprintf('Forward speed = %1.4f m/s', forward_speed));
    legend('lean','steer')

    % draw bike figure
    subplot(2,2,2)
    JBfig
    xl = xlim; yl = ylim;
    hold on;
    plot([xl(1) xl(1) xl(2) xl(2) xl(1)], ...
         [yl(1) yl(2) yl(2) yl(1) yl(1)], 'k')
    hold off;
    
    % plot eigenvalues
    subplot(2,2,4)
    JBvcrit %calculate critical speeds
    JBeig   %calculate eigenvalues
    JBrev   %plot them
    
    hold on;
    yl = ylim;
    plot([forward_speed forward_speed], [yl(1) yl(2)], 'k')
    hold off;
                
    % display critical speeds
    if isnan(vweave)
        title_str = sprintf('There is no weave speed');
    else
        title_str = sprintf('Weave speed = %1.4f m/s', vweave);
    end
    if isnan(vcapsize)
        title_str = sprintf('%s,\nthere is no capsize speed', title_str);
    else
        title_str = sprintf('%s,\ncapsize speed = %1.4f m/s', title_str, vcapsize);
    end
    title(title_str);
    
end

%-----------------------------------------------------------
% function called by MATLAB's integrator to calculate accelerations
%-----------------------------------------------------------
function zdot = bikerhs(t,z,v,K0,K2,C1,M0)

    % extract conditions
    q = z(1:2);
    qdot = z(3:4);

    % assemble right-hand side
    rhs = -( C1*v*qdot + (K0 + v^2*K2)*q);

    % calculate accelerations
    qddot = M0\rhs;

    % put into required form
    zdot = [qdot; qddot];

end
