% JBIKE6GUI M-file for JBike6GUI.fig

% Created by Andrew Dressel, 18-Jul-2003
% Copyright © 2003-2015 Schwab, Papadopoulos, Ruina, & Dressel
% Delft University of Technology & Cornell University


%      JBIKE6GUI, by itself, creates a new JBIKE6GUI or raises the existing
%      singleton*.
%
%      H = JBIKE6GUI returns the handle to a new JBIKE6GUI or the handle to
%      the existing singleton*.
%
%      JBIKE6GUI('CALLBACK',hObject,eventData,handles,...) calls the local
%      function named CALLBACK in JBIKE6GUI.M with the given input arguments.
%
%      JBIKE6GUI('Property','Value',...) creates a new JBIKE6GUI or raises the
%      existing singleton*.  Starting from the left, property value pairs
%      are
%      applied to the GUI before JBike6GUI_OpeningFunction gets called.  An
%      unrecognized property name or invalid value makes property application
%      stop.  All inputs are passed to JBike6GUI_OpeningFcn via varargin.
%
%      *See GUI Options on GUIDE's Tools menu.  Choose "GUI allows only one
%      instance to run (singleton)".
%
% See also: GUIDE, GUIDATA, GUIHANDLES

% Edit the above text to modify the response to help JBike6GUI

% Last Modified by GUIDE v2.5 08-Sep-2012 15:47:44
% Modification History
% 11/01/05 AED - call new JBvroot
%              - New user parameter: vel_steps
% 11/03/05 AED - New user parameter: min_vel
%              - Move on-line help to html
%              - Use green for weave speed: onset of stability
% 11/05/05 AED - New user parameter: front and rear wheel Ixx
%              - New user parameter: g
%              - Clean up what get's saved and restored from ini files
%              - g, min_vel, max_vel, and vel_steps are stored but only as comments
%              - even if read from ini file, they are overwritten with current GUI values
%              - Updated help
% 11/06/05 AED - Let user toggle between UV and XY for front fork and basket
%              - Check for and complain about bad parameters: mass, inertia
%              - Tweak main window layout
%              - Change Swinn to Schwinn
%              - Update help
%              - Add menu shortcut keys CTRL+H for help, etc.
% 11/07/05 AED - Saved with guide set for 'Ensure backward compatibility -v6'
% 11/08/05 AED - Change JBvroot to JBdroot
%              - New bike configuration subdirectory
% 11/09/05 AED - remove double use of CTRL+p
%              - set plotting styles in JBini.m
%              - display some feedback in command window so user can know what is taking so long
%              - don't reset min, max and speed step when switching bikes
%              - check for invalid speeds better
%              - let user toggle between double root finding methods
%              - split JBdroot.m into JBdoubleroots.m and JBroots.m
%              - remove mention of styles from menu system
% 11/10/05 AED - New Styles menu to set colors and dot sizes
%              - Save user setting in configuration file and load at startup
%              - fix bug in labeling wheelbase of backwards bike
%              - keep name and version in single place: JBini.m', ...
%              - setting to save user settings, or not
% 11/11/05 AED - use user-setable symbols, line types, and sizes
%              - user selectable predefined black and white style
%              - option to use styles in plot4 window
% 11/14/05 AED - label colors or symbols better for real and imaginary
% 11/15/05 AED - option to display legend on eigenvalue plot
%              - option to run in 'verbose' mode or not
%              - display of M0, C1, K0, and K2 moved to JBmck.ms
% 11/16/05 AED - option to save eigenvalues to a file
% 11/29/05 AED - don't force min speed to be <= max speed, just ~=
% 12/04/05 AED - fix bug in set_ylabel_str with draw_imaginary_parts
% 12/20/05 AED - Alphabetize bikes when reading them in.
%              - save bike name, not number, in configuration file.
%              - remove periods from file names and other characters MS Windows does not allow 
%              - fix bug with writing files with XY coords for front end
% 1/26/06 AED  - add support for MATLAB version 6.x
% 1/28/06 AED  - add absolute file addressing to support MATLAB version 6.x
% 2/06/06 AED  - silence echo of waitbar handle
% 2/06/06 AED  - don't draw UV axis if in XY mode
% 3/12/06 AED  - force 'word_dir' to be absolute, not relative.
%              - use MATLAB's filesep function for transportability.
%              - also use absolute path for JBconfig.m
%              - do best to work with version 6.x as well
% 9/11/06 AED  - New control to draw additional plots
%              - Change menu name from 'styles' to 'plot styles'
%              - Add menu options for 'bigger styles' and 'smaller styles'
%              - Change 'Click for more information' to 'Help: click for more informaiton'
%              - Change 'Using JBike6...' to 'Help: using JBike6...'
%              - Add tooltips for 'U', 'V', and 'alpha'
%              - Use web command instead of dos command to launch help'
% 9/12/06 AED  - replace blanks with zeros when user presses 'Calculate' button
%              - Better handle launching help on different system'
% 9/21/06 AED  - Calculate and display max and total stability
%              - Check for and warn about tipping forward
% 9/22/06 AED  - Correct some create_fcn names in JBike6GUI.fig
%                which fixes some control colors on Mac & Linex
%                and finally eliminates weird edit39 stuff that hung around
%              - Temporarily disable stability calculation
%              - Change help file name variable from x to help_file
%10/03/06 AED  - Allow no mass in front end
%                (now handled better by JBaddb, JBvcrit, and JBpolyint)
%              - Allow all mass on the ground
%              - Re-enable stability calculation, make v6.0 compatible
%              - use strrep() instead of regexprep() for v6.0 compatibility
%              - use findstr() instead of strfind() for v6.0 compatibility
%              - Tested with MATLAB v6.0.0.88s
%10/11/06 AED  - Option to shade stable region and pick color
%              - Use minimum eigenvalue for stability threshold
%10/19/06 AED  - Allow (63+1+1) characters in file name, instead of 64
%              - Prevent commas in file names, not allowed by MATLAB
%              - Enforce MATLAB's 63 character root name length
%              - Protect against too long file names from other sources
%              - Display fork offset in figure
%              - Add button of 'flip' fork, calculate new trail and wb
%              - Restore mass off ground requirement to avoid 'Det Mass Matrix < 0'
%10/21/06 AED  - Flip fork Ucm along with trail and wheelbase
%              - Fix bug in loading bike (in UV) when GUI set to XY
%09/09/12 AED  - Support new fileparts() of MATLAB version 7.11+
%              - Fix Tipping_moment calculation, per rearwheelsteer group
%              - Better support CTRL+D, per Piet Lammertse
%              - Clean up small coordinates after reading from file
%10/29/14 AED  - Replace all instances of '\' with filesep
%02/08/15 AED  - Display alpha angle orientation with fixed angle
%              - Disable unavailable printer setup diaglog on Macs
%------------------------------------------------------------------

function varargout = JBike6GUI(varargin)
    % Begin initialization code - DO NOT EDIT (says MATLAB)
    % Get version number
v = version;
% Version 7 or later?
if str2num(v(1)) >= 7
	gui_Singleton = 1;
	gui_State = struct('gui_Name',       mfilename, ...
                       'gui_Singleton',  gui_Singleton, ...
                       'gui_OpeningFcn', @JBike6GUI_OpeningFcn, ...
                       'gui_OutputFcn',  @JBike6GUI_OutputFcn, ...
                       'gui_LayoutFcn',  [] , ...
                       'gui_Callback',   []);
	if nargin & isstr(varargin{1})
        gui_State.gui_Callback = str2func(varargin{1});
	end
	
	if nargout
        [varargout{1:nargout}] = gui_mainfcn(gui_State, varargin{:});
	else
        gui_mainfcn(gui_State, varargin{:});
    end
% Version 6
elseif str2num(v(1)) == 6
    if nargin == 0  % LAUNCH GUI
        
        fig = openfig(mfilename,'reuse');

        % Use system color scheme for figure:
        set(fig,'Color',get(0,'defaultUicontrolBackgroundColor'));

        % Generate a structure of handles to pass to callbacks, and store it. 
        handles = guihandles(fig);
        guidata(fig, handles);

        JBike6GUI_OpeningFcn(fig, 0, handles, varargin)

        if nargout > 0
            varargout{1} = fig;
        end

    elseif ischar(varargin{1}) % INVOKE NAMED SUBFUNCTION OR CALLBACK

        try
            [varargout{1:nargout}] = feval(varargin{:}); % FEVAL switchyard
        catch
            disp(lasterr);
        end

    end
% Earlier version
else
    disp(sprintf('Version %s of MATLAB not supported.', v))    
end
	% End initialization code - DO NOT EDIT (says MATLAB)
return
%------------------------------------------------------------------
% --- Executes just before JBike6GUI is made visible.
%------------------------------------------------------------------
function JBike6GUI_OpeningFcn(hObject, eventdata, handles, varargin)
	% This function has no output args, see OutputFcn.
	% hObject    handle to figure
	% eventdata  reserved - to be defined in a future version of MATLABf
	% handles    structure with handles and user data (see GUIDATA)
	% varargin   command line arguments to JBike6GUI (see VARARGIN)
    
    clc; %clear command window
    format compact;
	
    disp('JBike6 Initializing...')

    % Choose default command line output for JBike6GUI
	handles.output = hObject;
	
	% Update handles structure
	guidata(hObject, handles);

    % try to catch user closing window with x in upper right
    %set(gcf,'CloseRequestFcn','pushbutton_exit_Callback')
    % but this just makes a loop.
    
	% UIWAIT makes JBike6GUI wait for user response (see UIRESUME)
	% uiwait(handles.figure1);
    
    bike_name = ''; requested_bike = 0;% initialize bike to pick from list

    JBini; %'read in' all the constants 
    
    % store these away
    handles.app_name = app_name;
    handles.app_version = app_version;
    
    % Find directory that JBike6 was installed into
    
    v = version; % get MATLAB version number
    if str2num(v(1)) >= 7
        if str2num(v(1)) == 7 & sscanf(v(3:end), '%f') <= 10
            [JBike6_dir,source_file_name,ext,versn] = fileparts(mfilename('fullpath'));
        else
            [JBike6_dir,source_file_name,ext] = fileparts(mfilename('fullpath'));
        end
    else
        [JBike6_dir,source_file_name,ext,versn] = fileparts(mfilename);
    end
    if length(JBike6_dir) == 0 % if we didn't find anything
        JBike6_dir = pwd; % try MATLAB's work directory
    end
    JBike6_dir = strrep(JBike6_dir, 'Documents and Settings', 'Docume~1'); % shorten for MATLAB v6
    test = dir([JBike6_dir filesep 'JBconfig.m']); %look for configuration file
    if length(test) == 1      %if it is there
        run([JBike6_dir filesep 'JBconfig']); %'read in' any configuration (will override JBini values)
    else
        errordlg(sprintf('%s\n%s\n%s', 'Cannot find JBike6 configuration files (JBconfig.m) in', ...
                                       [JBike6_dir], ...
                                       'Using internal defaults.'), 'JBike6 Error')
    end
    handles.JBike6_dir = JBike6_dir;
    
    % save all these settings for GUI use
    handles.angle_units = angle_units;  %need to make this 'global' for popupmenu_angle_units_Callback function
    handles.draw_additional_plots = draw_additional_plots;
    handles.use_styles_in_plot4 = use_styles_in_plot4;
    handles.draw_coord_axes = draw_coord_axes;
    handles.draw_axis_lines = draw_axis_lines;
    handles.draw_grid_lines = draw_grid_lines;
    handles.draw_root_lines = draw_root_lines;
    handles.draw_weave_speed = draw_weave_speed;
    handles.draw_capsize_speed = draw_capsize_speed;
    handles.shade_stable_region = shade_stable_region;
    handles.draw_imaginary_parts = draw_imaginary_parts;
    handles.draw_legend = draw_legend;
    handles.gravity = gravity;
    handles.min_vel = min_vel;
    handles.max_vel = max_vel;
    handles.vel_steps = vel_steps;
    handles.XY_UV = XY_UV;
    handles.min_uvcm_mag = min_uvcm_mag;
    handles.work_dir = work_dir;
    handles.double_root_method = double_root_method;
    handles.save_settings = save_settings;
    handles.run_verbose = run_verbose;
    handles.x(9) = 114;
    
    % all the style information
    handles.weave_speed_color = weave_speed_color;
    handles.capsize_speed_color = capsize_speed_color;
    handles.double_root_speed_color = double_root_speed_color;
    handles.stable_region_shade_color = stable_region_shade_color;
    handles.real_eigen_color = real_eigen_color;
    handles.imag_eigen_color = imag_eigen_color;
    handles.axis_color = axis_color;
    handles.plot_background_color = plot_background_color;
    handles.real_eigen_symbol = real_eigen_symbol;
    handles.imag_eigen_symbol = imag_eigen_symbol;
    handles.weave_speed_line_type = weave_speed_line_type;
    handles.capsize_speed_line_type = capsize_speed_line_type;
    handles.double_root_speeds_line_type = double_root_speeds_line_type;
    handles.real_eigen_size = real_eigen_size;
    handles.imag_eigen_size = imag_eigen_size;
    handles.weave_speed_size = weave_speed_size;
    handles.capsize_speed_size = capsize_speed_size;
    handles.double_root_speeds_size = double_root_speeds_size;
    
    handles.min_eig_val_stable_thresh = min_eig_val_stable_thresh;

    % setup the GUI: checked menu items, etc.
    set(handles.popupmenu_angle_units, 'Value', angle_units);
    set(handles.edit_min_vel, 'string', sprintf('%.8g', min_vel));
    set(handles.edit_max_vel, 'string', sprintf('%.8g', max_vel));
    set(handles.edit_vel_steps, 'string', sprintf('%.8g', vel_steps));
    set(handles.figure1, 'Name', [app_name, ' ', app_version]);
    set(handles.text_date, 'string', date);
    
    if angle_units == 1
        unit_str = 'radians';
    else
        unit_str = 'degrees';
    end
    set(handles.text_units, 'string', sprintf('All units are kgs, meters, and %s.', unit_str));
    
    if draw_coord_axes == 1
      	set(handles.menu_draw_coord_axis, 'Checked', 'on');
    else
      	set(handles.menu_draw_coord_axis, 'Checked', 'off');
    end
    if draw_axis_lines == 1
      	set(handles.menu_draw_axis_lines, 'Checked', 'on');
    else
      	set(handles.menu_draw_axis_lines, 'Checked', 'off');
    end
    if draw_grid_lines == 1
      	set(handles.menu_draw_grid_lines, 'Checked', 'on');
    else
      	set(handles.menu_draw_grid_lines, 'Checked', 'off');
    end
    if draw_legend == 1
      	set(handles.menu_draw_legend, 'Checked', 'on');
    else
      	set(handles.menu_draw_legend, 'Checked', 'off');
    end
    if draw_additional_plots == 1
      	set(handles.menu_draw_additional_plots, 'Checked', 'on');
      	set(handles.checkbox_draw_additional_plots, 'Value', get(handles.checkbox_draw_additional_plots,'Max'));
    else
      	set(handles.menu_draw_additional_plots, 'Checked', 'off');
      	set(handles.checkbox_draw_additional_plots, 'Value', get(handles.checkbox_draw_additional_plots,'Min'));
    end
    if use_styles_in_plot4 == 1
      	set(handles.menu_use_styles_in_plot4, 'Checked', 'on');
    else
      	set(handles.menu_use_styles_in_plot4, 'Checked', 'off');
    end
    if draw_weave_speed == 1
      	set(handles.menu_draw_weave_speed, 'Checked', 'on');
    else
      	set(handles.menu_draw_weave_speed, 'Checked', 'off');
    end
    if draw_capsize_speed == 1
      	set(handles.menu_draw_capsize_speed, 'Checked', 'on');
    else
      	set(handles.menu_draw_capsize_speed, 'Checked', 'off');
    end
    if draw_root_lines == 1
      	set(handles.menu_draw_root_lines, 'Checked', 'on');
    else
      	set(handles.menu_draw_root_lines, 'Checked', 'off');
    end
    if shade_stable_region == 1
      	set(handles.menu_shade_stable_region, 'Checked', 'on');
    else
      	set(handles.menu_shade_stable_region, 'Checked', 'off');
    end
    if draw_imaginary_parts == 1
      	set(handles.menu_draw_imaginary_parts, 'Checked', 'on');
    else
      	set(handles.menu_draw_imaginary_parts, 'Checked', 'off');
    end
    if double_root_method == 1
      	set(handles.menu_double_root_method, 'Checked', 'on');
    else
      	set(handles.menu_double_root_method, 'Checked', 'off');
    end
    if save_settings == 1
      	set(handles.menu_save_settings, 'Checked', 'on');
    else
      	set(handles.menu_save_settings, 'Checked', 'off');
    end
    if XY_UV == 0 % 1 = UV, 0 = XY
        set(handles.text_axis_XU, 'string', 'X');
        set(handles.text_axis_YV, 'string', 'Y');
        set(handles.pushbutton_XY_UV, 'string', 'UV');
    end
    if run_verbose == (handles.x(9) - 113)
      	set(handles.menu_run_verbose, 'Checked', 'on');
    else
      	set(handles.menu_run_verbose, 'Checked', 'off');
    end
    
    %-------------------------------------------------------------------
    %'read in' all the bike parameters. 'read in' means 'run' MATLAB .m file
	%-------------------------------------------------------------------
    if length(bike_name) == 0
        bike_name = 'JBini_blank.m';
    end        

    % Make sure work_dir (subdirectory with ini files) is absolute, not
    % relative. That way if they haven't set MATLAB's current directory
    % to the JBike6 directory, this will all still work.
    %
    % Note: would like to change name of variable, but that would mess
    % up existing users' configuration files. Oh well. Just remember what
    % 'work_dir' really is: location of JBini_*.m files
    
    if length(findstr(work_dir, ':')) == 0 % not absolute
        v = version; % get MATLAB version number
        if str2num(v(1)) >= 7
            if str2num(v(1)) == 7 & sscanf(v(3:end), '%f') <= 10
                [pathstr,source_file_name,ext,versn] = fileparts(mfilename('fullpath'));
            else
                [pathstr,source_file_name,ext] = fileparts(mfilename('fullpath'));
            end
        else
            [pathstr,source_file_name,ext,versn] = fileparts(mfilename); %('fullpath') not supported by v6.0
        end
        if length(pathstr) > 0 % if we actually got a path to this m file
            work_dir = [pathstr filesep work_dir]; % make it absolute
        else
            work_dir = [pwd filesep work_dir]; % stuck with using MATLAB's 'current' directory
        end
        JBike6_dir = strrep(work_dir, 'Documents and Settings', 'Docume~1'); % shorten for MATLAB v6
        handles.work_dir = work_dir;
    end

    %get all the bike ini files in the 'working' directory
    dir_struct = dir([work_dir filesep 'JBini_*.m']);
    
    % find and move 'blank' bike to top of the list
    if length(dir_struct) >= 1 %found some ini files in that directory
        usnames = [];
        handles.x(4) = 48;
        for bike = 1:length(dir_struct)
            if ~strcmp(dir_struct(bike).name, 'JBini_blank.m')
        %copy into a matrix for sorting
                 if length(dir_struct(bike).name) > (63+1+1) %Root plus dot and extension: '.m'
                     % too long so skip it, make sort last to fall off end of list below
                    disp(sprintf('Skipping %s because file name too long for MATLAB.', dir_struct(bike).name))
                    usnames(bike,:) = 'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ'; %must be (63+1+1) characters
                 else
                    usnames(bike,:) = [dir_struct(bike).name, blanks((63+1+1)-length(dir_struct(bike).name))];
                 end
            else
                usnames(bike,:) = blanks((63+1+1));
                if bike ~= (handles.x(4) - 47)
                    temp = dir_struct(1).name;
                    dir_struct(1).name = dir_struct(bike).name;
                    dir_struct(bike).name = temp;
                end
            end
        end
        snames = sortrows(usnames);
        for bike = 2:length(dir_struct)
            dir_struct(bike).name = char(snames(bike,:));
        end
        clear usnames snames
        
        % read all the bike ini files
        for bike = 1:length(dir_struct)
            
            v = version; % get MATLAB version number
            if str2num(v(1)) >= 7
                if str2num(v(1)) == 7 & sscanf(v(3:end), '%f') <= 10
                    [pathstr, file_name, ext, versn] = fileparts(dir_struct(bike).name);
                else
                    [pathstr, file_name, ext] = fileparts(dir_struct(bike).name);
                end
            else
                [pathstr, file_name, ext, versn] = fileparts(dir_struct(bike).name);
            end
            
            if length(file_name) > (63) % Just the root, not dot nor extension
                % too long so skip it
            else

                comment = ''; % initialize

                % need the absolute addressing to support MATLAB V 6.x
                % that should now be handled above when 'work_dir' is made
                % to be absolute.
                run([work_dir filesep file_name]); % 'read' all the parameters

                if strcmp(comment, '')
                    comment = 'No comment.';
                end

                % reset these values incase file tried to set them
                gravity = handles.gravity;
                min_vel = handles.min_vel;
                max_vel = handles.max_vel;
                vel_steps = handles.vel_steps;

                % store all the parameters away in the handles structure
                handles.names(bike) = {name};
                if strncmp(bike_name, name, length(bike_name))
                    requested_bike = bike;
                end
                handles.comments(bike) = {comment};
                handles.wheelbases(bike) = wheelbase;
                handles.head_angles(bike) = head_angle;
                handles.trails(bike) = trail;
                handles.Drearwheels(bike) = Drearwheel;
                handles.mrearwheels(bike) = mrearwheel;
                handles.Irearwheels(bike,:) = Irearwheel;
                handles.alphaIrearwheels(bike) = alphaIrearwheel;
                handles.Dfrontwheels(bike) = Dfrontwheel;
                handles.mfrontwheels(bike) = mfrontwheel;
                handles.Ifrontwheels(bike,:) = Ifrontwheel;
                handles.alphaIfrontwheels(bike) = alphaIfrontwheel;
                handles.mriders(bike) = mrider;
                handles.xcmriders(bike) = xcmrider;
                handles.ycmriders(bike) = ycmrider;
                handles.Iriders(bike,:) = Irider;
                handles.alphaIriders(bike) = alphaIrider;
                handles.mframes(bike) = mframe;
                handles.xcmframes(bike) = xcmframe;
                handles.ycmframes(bike) = ycmframe;
                handles.Iframes(bike,:) = Iframe;
                handles.alphaIframes(bike) = alphaIframe;
                handles.mforks(bike) = mfork;
                handles.ucmforks(bike) = ucmfork;
                handles.vcmforks(bike) = vcmfork;
                handles.Iforks(bike,:) = Ifork;
                handles.alphaIforks(bike) = alphaIfork;
                handles.mbaskets(bike) = mbasket;
                handles.ucmbaskets(bike) = ucmbasket;
                handles.vcmbaskets(bike) = vcmbasket;
                handles.Ibaskets(bike,:) = Ibasket;
                handles.alphaIbaskets(bike) = alphaIbasket;
                handles.mracks(bike) = mrack;
                handles.xcmracks(bike) = xcmrack;
                handles.ycmracks(bike) = ycmrack;
                handles.Iracks(bike,:) = Irack;
                handles.alphaIracks(bike) = alphaIrack;
                handles.x(7) = 32;
            end
        end
    else
        errordlg(sprintf('%s\n%s\n%s', 'No bike configuration files (JBini.*.m) found in', ...
                                       [work_dir], ...
                                       'Using internal defaults.'), 'JBike6 Error')
        % store all the parameters away in the handles structure
        bike = 1;
        handles.names(bike) = {'blank'};
        handles.comments(bike) = {'Blank bike (all parameters zero). Use as a fresh start for a new bike. If you do, be sure to change the name.'};
        bike = 2;
        handles.names(bike) = {name};
        handles.comments(bike) = {'Built-in default bike'};
        handles.wheelbases(bike) = wheelbase;
        handles.head_angles(bike) = head_angle;
        handles.trails(bike) = trail;
        handles.Drearwheels(bike) = Drearwheel;
        handles.mrearwheels(bike) = mrearwheel;
        handles.Irearwheels(bike,:) = Irearwheel;
        handles.alphaIrearwheels(bike) = alphaIrearwheel;
        handles.Dfrontwheels(bike) = Dfrontwheel;
        handles.mfrontwheels(bike) = mfrontwheel;
        handles.Ifrontwheels(bike,:) = Ifrontwheel;
        handles.alphaIfrontwheels(bike) = alphaIfrontwheel;
        handles.mriders(bike) = mrider;
        handles.xcmriders(bike) = xcmrider;
        handles.ycmriders(bike) = ycmrider;
        handles.Iriders(bike,:) = Irider;
        handles.alphaIriders(bike) = alphaIrider;
        handles.mframes(bike) = mframe;
        handles.xcmframes(bike) = xcmframe;
        handles.ycmframes(bike) = ycmframe;
        handles.Iframes(bike,:) = Iframe;
        handles.alphaIframes(bike) = alphaIframe;
        handles.mforks(bike) = mfork;
        handles.ucmforks(bike) = ucmfork;
        handles.vcmforks(bike) = vcmfork;
        handles.Iforks(bike,:) = Ifork;
        handles.alphaIforks(bike) = alphaIfork;
        handles.mbaskets(bike) = mbasket;
        handles.ucmbaskets(bike) = ucmbasket;
        handles.vcmbaskets(bike) = vcmbasket;
        handles.Ibaskets(bike,:) = Ibasket;
        handles.alphaIbaskets(bike) = alphaIbasket;
        handles.mracks(bike) = mrack;
        handles.xcmracks(bike) = xcmrack;
        handles.ycmracks(bike) = ycmrack;
        handles.Iracks(bike,:) = Irack;
        handles.alphaIracks(bike) = alphaIrack;
        handles.x(7) = 32;
        requested_bike = bike;
    end    

    guidata(hObject, handles); %save 'global' data

	%-------------------------------------------------------------------
	% Pick first bike
	%-------------------------------------------------------------------
    if requested_bike == 0 % none requested?
        bike = 1;
    else
        bike = requested_bike;
    end

	JBsetcontrols(hObject, eventdata, handles, bike);

    pushbutton_draw_bike_Callback(handles.pushbutton_draw_bike, eventdata, handles);

return

%------------------------------------------------------------------
% Try to implement draw_bike when enter key pressed
% Sadly, appears only to work differently for each type of control. Oh well.
%------------------------------------------------------------------
%function key_pressed_Callback(hObject, eventdata, handles)
%     curr_char = uint8(get(hObject, 'CurrentCharacter'));
%     if curr_char == 13 % Enter key pressed?
%         pushbutton_draw_bike_Callback(handles.pushbutton_draw_bike, eventdata, handles);
%     end
%return

%------------------------------------------------------------------
% bike selection (popup menu)
%------------------------------------------------------------------
function popupmenu_name_Callback(hObject, eventdata, handles)

	% use Picked one
    bike = get(hObject,'Value');

    % get speeds in case user typed something new
    min_vel = str2num(get(handles.edit_min_vel, 'string'));
    max_vel = str2num(get(handles.edit_max_vel, 'string'));
    vel_steps = str2num(get(handles.edit_vel_steps, 'string'));
    handles.min_vel = min_vel;
    handles.max_vel = max_vel;
    handles.vel_steps = vel_steps;
    handles.x(10) = 101;
    guidata(hObject, handles); %save 'global' data

  	JBsetcontrols(hObject, eventdata, handles, bike);

    pushbutton_draw_bike_Callback(handles.pushbutton_draw_bike, eventdata, handles);
return

%------------------------------------------------------------------
% Units
%------------------------------------------------------------------
function popupmenu_angle_units_Callback(hObject, eventdata, handles)
    new_angle_units = get(hObject,'Value');
    if new_angle_units ~= handles.angle_units
        if new_angle_units == 1 % radians
            angle_conv = pi/180;
            unit_str = 'radians';
        else
            angle_conv = 180/pi;
            unit_str = 'degrees';
        end
        set(handles.text_units, 'string', sprintf('All units are kgs, meters, and %s.', unit_str));
        head_angle = str2num(get(handles.edit_head_angle, 'string'));
        set(handles.edit_head_angle, 'string', sprintf('%.8g', head_angle*angle_conv));

        alphaIrider = str2num(get(handles.edit_rider_angle, 'string'));
        set(handles.edit_rider_angle, 'string', sprintf('%.8g', alphaIrider*angle_conv));

        alphaIframe = str2num(get(handles.edit_rear_frame_angle, 'string'));
        set(handles.edit_rear_frame_angle, 'string', sprintf('%.8g', alphaIframe*angle_conv));

        alphaIfork = str2num(get(handles.edit_front_fork_angle, 'string'));
        set(handles.edit_front_fork_angle, 'string', sprintf('%.8g', alphaIfork*angle_conv));

        alphaIbasket = str2num(get(handles.edit_front_basket_angle, 'string'));
        set(handles.edit_front_basket_angle, 'string', sprintf('%.8g', alphaIbasket*angle_conv));

        alphaIrack = str2num(get(handles.edit_rear_rack_angle, 'string'));
        set(handles.edit_rear_rack_angle, 'string', sprintf('%.8g', alphaIrack*angle_conv));

        handles.angle_units = new_angle_units;
        handles.x(1) = 169;
        guidata(hObject, handles); %save 'global' data
    end
return

%------------------------------------------------------------------
% Buttons
%------------------------------------------------------------------
% --------------------------------------------------------------------
% XY/UV button % 1 = UV, 0 = XY
% --------------------------------------------------------------------
function pushbutton_XY_UV_Callback(hObject, eventdata, handles)
    wheelbase = str2num(get(handles.edit_wheel_base, 'string'));
    head_angle = str2num(get(handles.edit_head_angle, 'string'));
    % get the units and adjust angles as necessary
    angle_units = get(handles.popupmenu_angle_units,'Value');
    if angle_units == 2 %degrees
        head_angle = head_angle*pi/180; %convert from degrees to radians
    end
    sha = sin(pi/2-head_angle);
    cha = cos(pi/2-head_angle);
    
    trail = str2num(get(handles.edit_trail, 'string'));
    u_0 = wheelbase+trail;
    v_0 = 0;
    
    if handles.XY_UV == 1 % 1 = UV, 0 = XY
        % switching to XY
        handles.XY_UV = 0;
        set(handles.text_axis_XU, 'string', 'X');
        set(handles.text_axis_YV, 'string', 'Y');
        set(handles.pushbutton_XY_UV, 'string', 'UV');
                
		ucmfork = str2num(get(handles.edit_front_fork_cmx, 'string'));
		vcmfork = str2num(get(handles.edit_front_fork_cmy, 'string'));
		ucmbasket = str2num(get(handles.edit_front_basket_cmx, 'string'));
		vcmbasket = str2num(get(handles.edit_front_basket_cmy, 'string'));
        
        xcmfork = u_0 + ucmfork * cha - vcmfork * sha;
        ycmfork = v_0 + ucmfork * sha + vcmfork * cha;
        xcmbasket = u_0 + ucmbasket * cha - vcmbasket * sha;
        ycmbasket = v_0 + ucmbasket * sha + vcmbasket * cha;
        
        if abs(xcmfork) < handles.min_uvcm_mag
            xcmfork = 0;
        end
        if abs(ycmfork) < handles.min_uvcm_mag
            ycmfork = 0;
        end
        if abs(xcmbasket) < handles.min_uvcm_mag
            xcmbasket = 0;
        end
        if abs(ycmbasket) < handles.min_uvcm_mag
            ycmbasket = 0;
        end
        
        set(handles.edit_front_fork_cmx, 'string', sprintf('%.8g', xcmfork));
        set(handles.edit_front_fork_cmy, 'string', sprintf('%.8g', ycmfork));
        set(handles.edit_front_basket_cmx, 'string', sprintf('%.8g', xcmbasket));
        set(handles.edit_front_basket_cmy, 'string', sprintf('%.8g', ycmbasket));
    else
        % switching to UV
        handles.XY_UV = 1;
        set(handles.text_axis_XU, 'string', 'U');
        set(handles.text_axis_YV, 'string', 'V');
        set(handles.pushbutton_XY_UV, 'string', 'XY');

        xcmfork = str2num(get(handles.edit_front_fork_cmx, 'string'));
		ycmfork = str2num(get(handles.edit_front_fork_cmy, 'string'));
		xcmbasket = str2num(get(handles.edit_front_basket_cmx, 'string'));
		ycmbasket = str2num(get(handles.edit_front_basket_cmy, 'string'));
        
        ucmfork = (xcmfork - u_0) * cha + (ycmfork - v_0) * sha;
        vcmfork = -(xcmfork - u_0) * sha + (ycmfork - v_0) * cha;
        ucmbasket = (xcmbasket - u_0) * cha + (ycmbasket - v_0) * sha;
        vcmbasket = -(xcmbasket - u_0) * sha + (ycmbasket - v_0) * cha;
        
        if abs(ucmfork) < handles.min_uvcm_mag
            ucmfork = 0;
        end
        if abs(vcmfork) < handles.min_uvcm_mag
            vcmfork = 0;
        end
        if abs(ucmbasket) < handles.min_uvcm_mag
            ucmbasket = 0;
        end
        if abs(vcmbasket) < handles.min_uvcm_mag
            vcmbasket = 0;
        end

        set(handles.edit_front_fork_cmx, 'string', sprintf('%.8g', ucmfork));
        set(handles.edit_front_fork_cmy, 'string', sprintf('%.8g', vcmfork));
        set(handles.edit_front_basket_cmx, 'string', sprintf('%.8g', ucmbasket));
        set(handles.edit_front_basket_cmy, 'string', sprintf('%.8g', vcmbasket));

    end
    handles.x(2) = 32;
    guidata(hObject, handles); %save 'global' data
return
% --------------------------------------------------------------------
% Draw Bike / Calculate button
% --------------------------------------------------------------------
function pushbutton_draw_bike_Callback(hObject, eventdata, handles)

    lamb = [0 0;0 0]; % over-ride built-in lamb() function of MATLAB v6
    
    tic; % start the clock
    
    check_for_blanks(handles); %otherwise JBaxis has trouble
    
    min_eig_val_stable_thresh = handles.min_eig_val_stable_thresh;
    run_verbose = handles.run_verbose;

    app_name = handles.app_name;
    app_version = handles.app_version;
    
    gravity = handles.gravity;
    bike = get(handles.popupmenu_name,'Value');

    if bike ~= 1 %need to check bike number because user could modify name
        % get the bicycle parameters from handles structure, and
        % put them into the variables that the original JBike6 expects
        name = get(handles.edit_name, 'string');
        comment = get(handles.edit_comments, 'string');
		wheelbase = str2num(get(handles.edit_wheel_base, 'string'));
		head_angle = str2num(get(handles.edit_head_angle, 'string'));
		trail = str2num(get(handles.edit_trail, 'string'));
		Drearwheel = str2num(get(handles.edit_rear_wheel_diameter, 'string'));
		mrearwheel = str2num(get(handles.edit_rear_wheel_mass, 'string'));
		Irearwheel(1) = str2num(get(handles.edit_rear_wheel_Ixx, 'string'));
		Irearwheel(2) = Irearwheel(1);
		Irearwheel(3) = str2num(get(handles.edit_rear_wheel_Izz, 'string'));
		alphaIrearwheel = 0;
		Dfrontwheel = str2num(get(handles.edit_front_wheel_diameter, 'string'));
		mfrontwheel = str2num(get(handles.edit_front_wheel_mass, 'string'));
		Ifrontwheel(1) = str2num(get(handles.edit_front_wheel_Ixx, 'string'));
		Ifrontwheel(2) = Ifrontwheel(1);
		Ifrontwheel(3) = str2num(get(handles.edit_front_wheel_Izz, 'string'));
		alphaIfrontwheel = 0;
		mrider = str2num(get(handles.edit_rider_mass, 'string'));
		xcmrider = str2num(get(handles.edit_rider_cmx, 'string'));
		ycmrider = str2num(get(handles.edit_rider_cmy, 'string'));
		Irider(1) = str2num(get(handles.edit_rider_I11, 'string'));
		Irider(2) = str2num(get(handles.edit_rider_I22, 'string'));
		Irider(3) = str2num(get(handles.edit_rider_Izz, 'string'));
		alphaIrider = str2num(get(handles.edit_rider_angle, 'string'));
		mframe = str2num(get(handles.edit_rear_frame_mass, 'string'));
		xcmframe = str2num(get(handles.edit_rear_frame_cmx, 'string'));
		ycmframe = str2num(get(handles.edit_rear_frame_cmy, 'string'));
		Iframe(1) = str2num(get(handles.edit_rear_frame_I11, 'string'));
		Iframe(2) = str2num(get(handles.edit_rear_frame_I22, 'string'));
		Iframe(3) = str2num(get(handles.edit_rear_frame_Izz, 'string'));
		alphaIframe = str2num(get(handles.edit_rear_frame_angle, 'string'));
		mfork = str2num(get(handles.edit_front_fork_mass, 'string'));
		ucmfork = str2num(get(handles.edit_front_fork_cmx, 'string'));
		vcmfork = str2num(get(handles.edit_front_fork_cmy, 'string'));
		Ifork(1) = str2num(get(handles.edit_front_fork_I11, 'string'));
		Ifork(2) = str2num(get(handles.edit_front_fork_I22, 'string'));
		Ifork(3) = str2num(get(handles.edit_front_fork_Izz, 'string'));
		alphaIfork = str2num(get(handles.edit_front_fork_angle, 'string'));
		mbasket = str2num(get(handles.edit_front_basket_mass, 'string'));
		ucmbasket = str2num(get(handles.edit_front_basket_cmx, 'string'));
		vcmbasket = str2num(get(handles.edit_front_basket_cmy, 'string'));
		Ibasket(1) = str2num(get(handles.edit_front_basket_I11, 'string'));
		Ibasket(2) = str2num(get(handles.edit_front_basket_I22, 'string'));
		Ibasket(3) = str2num(get(handles.edit_front_basket_Izz, 'string'));
		alphaIbasket = str2num(get(handles.edit_front_basket_angle, 'string'));
		mrack = str2num(get(handles.edit_rear_rack_mass, 'string'));
		xcmrack = str2num(get(handles.edit_rear_rack_cmx, 'string'));
		ycmrack = str2num(get(handles.edit_rear_rack_cmy, 'string'));
		Irack(1) = str2num(get(handles.edit_rear_rack_I11, 'string'));
		Irack(2) = str2num(get(handles.edit_rear_rack_I22, 'string'));
		Irack(3) = str2num(get(handles.edit_rear_rack_Izz, 'string'));
        s = get(handles.edit_rear_rack_angle, 'string');
        if length(s) == 0
            s = '0';
        end
		alphaIrack = str2num(s);
	
        % get the units and adjust angles as necessary
        angle_units = get(handles.popupmenu_angle_units,'Value');
        if angle_units == 2 %degrees
            head_angle = head_angle*pi/180; %convert from degrees to radians
            alphaIrearwheel = alphaIrearwheel*pi/180;
            alphaIfrontwheel = alphaIfrontwheel*pi/180;
            alphaIrider = alphaIrider*pi/180;
            alphaIframe = alphaIframe*pi/180;
            alphaIfork = alphaIfork*pi/180;
            alphaIbasket = alphaIbasket*pi/180;
            alphaIrack = alphaIrack*pi/180;
        end

        if handles.XY_UV == 1 % 1 = UV, 0 = XY
            % don't have to do anything
        else
            u_0 = wheelbase+trail;
            v_0 = 0;
            xcmfork = ucmfork;
            ycmfork = vcmfork;
            xcmbasket = ucmbasket;
            ycmbasket = vcmbasket;
            sha = sin(pi/2-head_angle);
            cha = cos(pi/2-head_angle);
            ucmfork = (xcmfork - u_0) * cha + (ycmfork - v_0) * sha;
            vcmfork = -(xcmfork - u_0) * sha + (ycmfork - v_0) * cha;
            ucmbasket = (xcmbasket - u_0) * cha + (ycmbasket - v_0) * sha;
            vcmbasket = -(xcmbasket - u_0) * sha + (ycmbasket - v_0) * cha;
        end
        
		lambda = pi/2-head_angle; %convert from head angle to JBike-specific lambda
	
        % clear everything from previous bike, especially in case calculations
        % go wrong and nothing new gets drawn, i.e. when wheelbase is zero
		axes(handles.axes_bike);
        title('');
		cla;
		axes(handles.axes_eig); 
        title('');
		cla;
        set(handles.text_Capsize_speed, 'string', '');
        
        % check parameters to make sure nothing 'goes wrong'.
   		% get and check maximum velocity, correct if necessary
      	min_vel = str2num(get(handles.edit_min_vel, 'string'));
        if length(min_vel) == 0
            min_vel = 0;
            set(handles.edit_min_vel, 'string', sprintf('%.8g', min_vel));
        end
        set(handles.edit_min_vel, 'string', sprintf('%.8g', min_vel));
      	max_vel = str2num(get(handles.edit_max_vel, 'string'));
        if length(max_vel) == 0
            max_vel = 0.0;
            set(handles.edit_max_vel, 'string', sprintf('%.8g', max_vel));
        end
        if max_vel == min_vel
            max_vel = min_vel + 1;
            set(handles.edit_max_vel, 'string', sprintf('%.8g', max_vel));
        end
      	vel_steps = str2num(get(handles.edit_vel_steps, 'string'));
        if length(vel_steps) == 0
            vel_steps = 2;
            set(handles.edit_vel_steps, 'string', sprintf('%.8g', vel_steps));
        end
        if vel_steps <= 1
            vel_steps = 2;
            set(handles.edit_vel_steps, 'string', sprintf('%.8g', vel_steps));
        end
        
        % check for zero wheelbase
        if wheelbase == 0
            warndlg('Wheelbase cannot be zero.','invalid wheel wheelbase');
            return
        end

        % check for negative or zero diameters
        if Drearwheel <= 0 | Dfrontwheel <= 0
            warndlg('Wheel diameters must be greater than zero.','invalid wheel diameters');
            return
        end
        
        % check for negative masses
        if mrearwheel < 0 | mfrontwheel < 0 | mframe < 0 | mfork < 0 | ...
           mrider < 0 | mrack < 0 | mbasket < 0
            warndlg('Masses cannot be negative.','invalid masses');
            return
        end
        
        % check for no mass in front end
%         if mfrontwheel == 0 & mfork == 0 & mbasket == 0
%             warndlg('Front end (front wheel, fork, or basket) must have some mass.','invalid masses');
%             return
%         end
        
        % check for no mass off the ground otherwise Determinant of Mass Matrix < 0
        if Drearwheel * mrearwheel == 0 & Dfrontwheel * mfrontwheel == 0 & ...
           ycmframe * mframe == 0 & ycmrider * mrider == 0 & ycmrack * mrack == 0 & ...
           vcmfork * mfork == 0 & vcmbasket * mbasket == 0
            warndlg('Some mass must be off the ground.','invalid masses or y & v');
            return
        end

        % check for valid inertia
        if ~JBCheckInertia(Ifrontwheel, 'Front Wheel') | ...
           ~JBCheckInertia(Irearwheel, 'Rear Wheel') | ...
           ~JBCheckInertia(Iframe, 'Frame') | ...
           ~JBCheckInertia(Ifork, 'Fork') | ...
           ~JBCheckInertia(Irider, 'Rider') | ...
           ~JBCheckInertia(Irack, 'Rack') | ...
           ~JBCheckInertia(Ibasket, 'Basket')
            return
        end
        
        try % start worrying about errors
        
            % draw the bike
            axes(handles.axes_bike);
            JBfig
            if handles.draw_coord_axes
                JBaxis(hObject, eventdata, handles, wheelbase, head_angle, trail, Dfrontwheel)
            end
            
            % calculate the linearized equations of motion
            if run_verbose == 1
                disp('Calculating the linearized equations of motion...') % in case this takes a while
                wbh = waitbar(0.0,'Calculating the linearized equations of motion...', 'Name', 'JBike6 is working...');
            end

            JBmck

            if handles.draw_weave_speed == 1 | handles.draw_capsize_speed == 1 | handles.shade_stable_region
                % calculate the capsize speed
                %JBvcap; %now in JBvcrit

                % calculate the weave speed
                %JBvweave; %now in JBvcrit

                % calculate the weave and capsize speed
                if run_verbose == 1
                    disp('  Finding capsize and weave speeds...') % in case this takes a while
                    waitbar(0.2,wbh,'Finding capsize and weave speeds...')
                end
                JBvcrit; 
                
                % display them
                if handles.draw_weave_speed == 0 & handles.shade_stable_region == 0
                    title_str = sprintf('Weave speed not calculated');
                    msg = sprintf('\t not calculated');
                elseif isnan(vweave)
                    title_str = sprintf('There is no weave speed');
                    msg = sprintf('\t none');
                else
                    title_str = sprintf('Weave speed = %1.4f m/s', vweave);
                    msg = sprintf('\t %1.16f', vweave);
                end
                if handles.draw_capsize_speed == 0 & handles.shade_stable_region == 0
                    title_str = sprintf('%s, capsize speed not calculated', title_str);
                    msg = sprintf('%s \t not calculated', msg);
                elseif isnan(vcapsize)
                    title_str = sprintf('%s, there is no capsize speed', title_str);
                    msg = sprintf('%s \t none', msg);
                else
                    title_str = sprintf('%s, capsize speed = %1.4f m/s', title_str, vcapsize);
                    msg = sprintf('%s \t %1.16f', msg, vcapsize);
                end
                if run_verbose == 1
                    disp(sprintf('\t weave \t\t\t\t\t capsize'))
                    disp(msg)
                end
                set(handles.text_Capsize_speed, 'string', title_str);
                handles.vcapsize = vcapsize;
                handles.vweave = vweave;
                guidata(hObject, handles); %save 'global' data
            end

            % calculate double root speed(s)
            if handles.double_root_method == 0 % 0 = analytically
                if handles.draw_root_lines == 1
                    if run_verbose == 1
                        disp('  Finding double roots...') % in case this takes a while
                        waitbar(0.4,wbh,'Finding double roots...')
                    end
                    JBdoubleroots; %(uses Symbolic tool box)
                else
                    vdr = []; % empty this so that JBrev knows what to do.
                end
            end

            % calculate the igenvalues and eigenvectors for a speed range
            if run_verbose == 1
                disp('  Calculating Eigenvalues...') % in case this takes a while
                waitbar(0.6,wbh,'Calculating Eigenvalues...')
            end
            JBeig

            % try to calculate 'maximum stability speed' and 'amount of stability'
            if run_verbose == 1
                disp('  Calculating ''Stability''...') % in case this takes a while
            end
            n=length(v);
            max_stability = min_eig_val_stable_thresh;
            max_stability_speed = -1;
            total_stability = 0;
            delta_v = v(2) - v(1);
            for i=1:n
                if max(real(lamb(i,:))) < min_eig_val_stable_thresh
                    total_stability = total_stability + ...
                                      (max(real(lamb(i,:))) * delta_v * 10);
                end
                if max(real(lamb(i,:))) < max_stability
                    max_stability = max(real(lamb(i,:)));
                    max_stability_speed = v(i);
                end
            end
            if max_stability_speed > -1
                if run_verbose == 1
                    disp(sprintf('    Found ''maximum stability'' of %1.16f at %1.2f m/s', ...
                        max_stability, max_stability_speed))
                    disp(sprintf('    Counted up ''total stability'' of %1.16f', ...
                        total_stability))
                end
                title_str = sprintf('%s\n''max stability'' = %1.4f at %1.2f m/s, ''total stability'' = %1.4f', ...
                                    title_str, max_stability, max_stability_speed, total_stability);
            else
                if run_verbose == 1
                    disp(sprintf('    Found no stability at any speed in specified range'))
                end
                title_str = sprintf('%s\nFound no stability at any speed in specified range', ...
                                    title_str);
            end
            set(handles.text_Capsize_speed, 'string', title_str);
            
            % check for tipping over
%             Tipping_moment = mfork * (sin(head_angle) * ucmfork) + ...
%                              mbasket * (sin(head_angle) * ucmbasket) - ...
%                              mrearwheel * (wheelbase - 0) - ...
%                              mrider * (wheelbase - xcmrider) - ...
%                              mframe * (wheelbase - xcmframe) - ...
%                              mrack * (wheelbase - xcmrack);
            % fix problem discovered by Martijn, Pier, Stef, and Wouter of
            % the rearwheelsteeredbicycle project at TUDelft
            Tipping_moment = mfork * (trail + sin(head_angle) * ucmfork - cos(head_angle) * vcmfork) + ...
                   mbasket * (trail + sin(head_angle) * ucmbasket - cos(head_angle) * vcmbasket) - ...
                   mrearwheel * (wheelbase - 0) - ...
                   mrider * (wheelbase - xcmrider) - ...
                   mframe * (wheelbase - xcmframe) - ...
                   mrack * (wheelbase - xcmrack);

            if Tipping_moment > 0
                wstr = sprintf('  Warning! Bike will tip forward. Moment = %1.4f kg-m', ...
                              Tipping_moment);
                disp(wstr)
                axes(handles.axes_bike);
                text(min(xlim), min(ylim), wstr)
            elseif run_verbose == 1
                wstr = sprintf('    Tipping moment = %1.4f kg-m', ...
                              Tipping_moment);
                disp(wstr)
            end
            
            % calculate root speed(s) (based on eigenvalues)
            if handles.double_root_method == 1 % 1 = interpolate from eigenvalues
                if handles.draw_root_lines == 1
                    if run_verbose == 1
                        disp('  Finding roots...') % in case this takes a while
                        waitbar(0.8,wbh,'Finding double roots...')
                    end
                    JBroots;
                else
                    vdr = []; % empty this so that JBrev knows what to do.
                end
            end

            % plot only the Real part of the eigenvalues
            axes(handles.axes_eig);
            cla;
            draw_imaginary_parts = handles.draw_imaginary_parts;

            % get styles out of 'storage'
            weave_speed_color = handles.weave_speed_color;
            capsize_speed_color = handles.capsize_speed_color;
            double_root_speed_color = handles.double_root_speed_color;
            stable_region_shade_color = handles.stable_region_shade_color;
            real_eigen_color = handles.real_eigen_color;
            imag_eigen_color = handles.imag_eigen_color;
            axis_color = handles.axis_color;
            plot_background_color = handles.plot_background_color;
            real_eigen_size = handles.real_eigen_size;
            imag_eigen_size = handles.imag_eigen_size;
            weave_speed_line_type = handles.weave_speed_line_type;
            capsize_speed_line_type = handles.capsize_speed_line_type;
            double_root_speeds_line_type = handles.double_root_speeds_line_type;
            real_eigen_symbol = handles.real_eigen_symbol;
            imag_eigen_symbol = handles.imag_eigen_symbol;
            weave_speed_size = handles.weave_speed_size;
            capsize_speed_size = handles.capsize_speed_size;
            double_root_speeds_size = handles.double_root_speeds_size;

            draw_axis_lines = handles.draw_axis_lines;
            draw_grid_lines = handles.draw_grid_lines;
            draw_weave_speed = handles.draw_weave_speed;
            draw_capsize_speed = handles.draw_capsize_speed;
            shade_stable_region = handles.shade_stable_region;
            draw_legend = handles.draw_legend;

            ylabel_str = set_ylabel_str(real_eigen_symbol, real_eigen_color, imag_eigen_symbol, imag_eigen_color, draw_imaginary_parts);

            axes_eig = handles.axes_eig;
            JBrev

            if handles.draw_additional_plots
                use_styles_in_plot4 = handles.use_styles_in_plot4;
                % plot these eigenvalues as a function of the speed
                JBplot4
            end

            % need to save these incase user wants to export them
            handles.speed = speed;
            handles.lambdas = lambdas;
            guidata(hObject, handles); %save 'global' data

            t = toc;
            if run_verbose == 1
                disp(sprintf('Done. Elapsed time = %g seconds', t))
                waitbar(1,wbh,'Done.')
                close(wbh)
            end

        catch % if an error did occur, execution should continue here
            v = version;
            % Version 7 or later?
            if str2num(v(1)) >= 7
                [lastmsg, lastID] = lasterr;
            else
                [lastmsg] = lasterr;
            end
            if run_verbose == 1
                disp(lastmsg)
                disp('An error has occured.') % put message in command window
                if exist('wbh') % make sure we don't add insult to injury
                    close(wbh) % close waitbar
                end
            end
            errordlg(['An unanticipated error has occured. JBike6 is fine, ' ...
                     'but cannot calculate eigenvalues for this bike. Try ' ...
                     'changing the parameters and calculating again. See ' ...
                     'on-line help for more information.'],'JBike6 Error')
        end
    else % bike == 1
        % warndlg(sprintf('%s\n%s', 'There is nothing to plot', 'Pick a different bike and try again.'), 'Warning', 'modal');
		axes(handles.axes_bike);
		cla;
        axis off;
        title('');
        text(0.1, 0.65, 'Select a bike from pull-down menu above,');
        text(0.1, 0.60, 'or modify parameters above (including');
        text(0.1, 0.55, 'name, "blank" will not plot), and click on');
        text(0.1, 0.50, '"Save bike" and then "Calculate" buttons.');
        text(0.1, 0.40, 'Select "Using JBike6..." from the help menu,');
        text(0.1, 0.35, 'or press CTRL+h for more information.');
		axes(handles.axes_eig);
		cla;
        title('');
        set(handles.text_Capsize_speed, 'string', '');
    end
return

function [valid] = JBCheckInertia(I, name)
    valid = JBInertiaValid(I);
    if ~valid
        warndlg(sprintf('%s inertia invalid. No single inertia component can be negative or greater than the other two combined.', name),'invalid inertia');
    end
return
function [valid] = JBInertiaValid(I)
    if I(1) < 0 | I(2) < 0 | I(3) < 0
        valid = 0;
        return
    end
    if (I(1) - I(2) - I(3)) > 1e-16
        valid = 0;
        return
    end
    if (I(2) - I(3) - I(1)) > 1e-16
        valid = 0;
        return
    end
    if (I(3) - I(1) - I(2)) > 1e-16
        valid = 0;
        return
    end
    valid = 1; % else it is okay
return
% --------------------------------------------------------------------
% build the string used to label the y axis
% --------------------------------------------------------------------
function [ylabel_str] = set_ylabel_str(real_eigen_symbol, real_eigen_color, imag_eigen_symbol, imag_eigen_color, draw_imaginary_parts);
    if draw_imaginary_parts
        if real_eigen_symbol ~= imag_eigen_symbol
            ylabel_str = sprintf('Re(\\lambda) in ''%s'' and Im(\\lambda) in ''%s'' - 1/s\nStable <-> Unstable', real_eigen_symbol, imag_eigen_symbol);
        else
            for i = 1:2
                if i == 1
                    color = imag_eigen_color;
                else
                    color = real_eigen_color;
                end
                for j = 1:3
                    if color(j) > 0.75
                        color(j) = 1;
                    elseif color(j) < 0.75
                        color(j) = 0;
                    end
                end
                if sum(color == [1 0 0]) == 3
                    str = 'red';
                elseif sum(color == [0 1 0]) == 3
                    str = 'green';
                elseif sum(color == [0 0 1]) == 3
                    str = 'blue';
                elseif sum(color == [0 1 1]) == 3
                    str = 'cyan';
                elseif sum(color == [1 0 1]) == 3
                    str = 'magenta';
                elseif sum(color == [1 1 0]) == 3
                    str = 'yellow';
                elseif sum(color == [1 1 1]) == 3
                    str = 'white';
                elseif sum(color == [0 0 0]) == 3
                    str = 'black';
                else
                    str = 'color';
                end
                if i == 1
                    im_str = str;
                else
                    re_str = str;
                end
            end
            ylabel_str = sprintf('Re(\\lambda) in %s and Im(\\lambda) in %s - 1/s\nStable <-> Unstable', re_str, im_str);
        end
    else
        ylabel_str = sprintf('Re(\\lambda) - 1/s\nStable <-> Unstable');
    end
return
% --------------------------------------------------------------------
% Save Bike button
% --------------------------------------------------------------------
function pushbutton_save_bike_Callback(hObject, eventdata, handles)

    work_dir = handles.work_dir;
    gravity = handles.gravity;
    bike = get(handles.popupmenu_name,'Value');
    
    % get the bicycle parameters
    cell_name = get(handles.edit_name, 'string');
    name = char(cell_name);
    if strcmp(name, 'blank') %need to check actual name because user could modify bike #1
        warndlg(sprintf('%s\n%s', 'You should not modify ''blank'' bike.', 'Edit the name and try again.'), 'Warning', 'modal');
    else
        check_for_blanks(handles);
        cell_comment = get(handles.edit_comments, 'string');
        comment = char(cell_comment);
		wheelbase = str2num(get(handles.edit_wheel_base, 'string'));
		head_angle = str2num(get(handles.edit_head_angle, 'string'));
		trail = str2num(get(handles.edit_trail, 'string'));
		Drearwheel = str2num(get(handles.edit_rear_wheel_diameter, 'string'));
		mrearwheel = str2num(get(handles.edit_rear_wheel_mass, 'string'));
		Irearwheel(1) = str2num(get(handles.edit_rear_wheel_Ixx, 'string'));
		Irearwheel(2) = Irearwheel(1);
		Irearwheel(3) = str2num(get(handles.edit_rear_wheel_Izz, 'string'));
		alphaIrearwheel = 0;
		Dfrontwheel = str2num(get(handles.edit_front_wheel_diameter, 'string'));
		mfrontwheel = str2num(get(handles.edit_front_wheel_mass, 'string'));
		Ifrontwheel(1) = str2num(get(handles.edit_front_wheel_Ixx, 'string'));
		Ifrontwheel(2) = Ifrontwheel(1);
		Ifrontwheel(3) = str2num(get(handles.edit_front_wheel_Izz, 'string'));
		alphaIfrontwheel = 0;
		mrider = str2num(get(handles.edit_rider_mass, 'string'));
		xcmrider = str2num(get(handles.edit_rider_cmx, 'string'));
		ycmrider = str2num(get(handles.edit_rider_cmy, 'string'));
		Irider(1) = str2num(get(handles.edit_rider_I11, 'string'));
		Irider(2) = str2num(get(handles.edit_rider_I22, 'string'));
		Irider(3) = str2num(get(handles.edit_rider_Izz, 'string'));
		alphaIrider = str2num(get(handles.edit_rider_angle, 'string'));
		mframe = str2num(get(handles.edit_rear_frame_mass, 'string'));
		xcmframe = str2num(get(handles.edit_rear_frame_cmx, 'string'));
		ycmframe = str2num(get(handles.edit_rear_frame_cmy, 'string'));
		Iframe(1) = str2num(get(handles.edit_rear_frame_I11, 'string'));
		Iframe(2) = str2num(get(handles.edit_rear_frame_I22, 'string'));
		Iframe(3) = str2num(get(handles.edit_rear_frame_Izz, 'string'));
		alphaIframe = str2num(get(handles.edit_rear_frame_angle, 'string'));
		mfork = str2num(get(handles.edit_front_fork_mass, 'string'));
		ucmfork = str2num(get(handles.edit_front_fork_cmx, 'string'));
		vcmfork = str2num(get(handles.edit_front_fork_cmy, 'string'));
		Ifork(1) = str2num(get(handles.edit_front_fork_I11, 'string'));
		Ifork(2) = str2num(get(handles.edit_front_fork_I22, 'string'));
		Ifork(3) = str2num(get(handles.edit_front_fork_Izz, 'string'));
		alphaIfork = str2num(get(handles.edit_front_fork_angle, 'string'));
		mbasket = str2num(get(handles.edit_front_basket_mass, 'string'));
		ucmbasket = str2num(get(handles.edit_front_basket_cmx, 'string'));
		vcmbasket = str2num(get(handles.edit_front_basket_cmy, 'string'));
		Ibasket(1) = str2num(get(handles.edit_front_basket_I11, 'string'));
		Ibasket(2) = str2num(get(handles.edit_front_basket_I22, 'string'));
		Ibasket(3) = str2num(get(handles.edit_front_basket_Izz, 'string'));
		alphaIbasket = str2num(get(handles.edit_front_basket_angle, 'string'));
		mrack = str2num(get(handles.edit_rear_rack_mass, 'string'));
		xcmrack = str2num(get(handles.edit_rear_rack_cmx, 'string'));
		ycmrack = str2num(get(handles.edit_rear_rack_cmy, 'string'));
		Irack(1) = str2num(get(handles.edit_rear_rack_I11, 'string'));
		Irack(2) = str2num(get(handles.edit_rear_rack_I22, 'string'));
		Irack(3) = str2num(get(handles.edit_rear_rack_Izz, 'string'));
		alphaIrack = str2num(get(handles.edit_rear_rack_angle, 'string'));
	
        % get the units
        angle_units = get(handles.popupmenu_angle_units,'Value');
        if angle_units == 2 %degrees?
            head_angle = head_angle*pi/180; %convert from degrees to radians
            alphaIrearwheel = alphaIrearwheel*pi/180;
            alphaIfrontwheel = alphaIfrontwheel*pi/180;
            alphaIrider = alphaIrider*pi/180;
            alphaIframe = alphaIframe*pi/180;
            alphaIfork = alphaIfork*pi/180;
            alphaIbasket = alphaIbasket*pi/180;
            alphaIrack = alphaIrack*pi/180;
        end
        
        if handles.XY_UV == 1 % 1 = UV, 0 = XY
            % don't have to do anything
        else
            xcmfork = ucmfork;
            ycmfork = vcmfork;
            xcmbasket = ucmbasket;
            ycmbasket = vcmbasket;
            sha = sin(pi/2-head_angle);
            cha = cos(pi/2-head_angle);
            u_0 = wheelbase+trail;
            v_0 = 0;
            ucmfork = (xcmfork - u_0) * cha + (ycmfork - v_0) * sha;
            vcmfork = -(xcmfork - u_0) * sha + (ycmfork - v_0) * cha;
            ucmbasket = (xcmbasket - u_0) * cha + (ycmbasket - v_0) * sha;
            vcmbasket = -(xcmbasket - u_0) * sha + (ycmbasket - v_0) * cha;
        end
        
        % get bike-specific constants
      	min_vel = str2num(get(handles.edit_min_vel, 'string'));
      	max_vel = str2num(get(handles.edit_max_vel, 'string'));
      	vel_steps = str2num(get(handles.edit_vel_steps, 'string'));
        
		lambda = pi/2-head_angle; %convert from head angle to the lambda JBike wants
	
        file_name = strrep(name, ' ', '_');     %remove blanks for MATLAB
        file_name = strrep(file_name, '.', ''); %periods cause problems too
        file_name = strrep(file_name, '(', ''); %remove parantheses from file name because
        file_name = strrep(file_name, ')', ''); %MATLAB thinks they indicate parameters
        file_name = strrep(file_name, '\', ''); %also remove characters MS Windows does not
        file_name = strrep(file_name, '/', ''); %allow in file names: any of \ / : * ? ” < > |
        file_name = strrep(file_name, ':', ''); %
        file_name = strrep(file_name, '*', ''); %
        file_name = strrep(file_name, '?', ''); %
        file_name = strrep(file_name, '"', ''); %
        file_name = strrep(file_name, '<', ''); %
        file_name = strrep(file_name, '>', ''); %
        file_name = strrep(file_name, '|', ''); %
        file_name = strrep(file_name, ',', ''); %MATLAB chokes on commas, too.
        
        % MATLAB maximum name length of 63 characters
        if length(file_name) > 63
            file_name = file_name(1:63);
        end
                
        file_name = sprintf('JBini_%s.m', file_name); % finally, put on prefix and extension
        	
        action = 2; %write file and add to list
        test = dir([work_dir filesep file_name]);
        if length(test) > 0
            ButtonName = questdlg(sprintf('%s\n%s\n%s', [work_dir filesep file_name], 'File already exists.', 'Overwrite?'), ...
                                  'Note', ...
                                  'Yes','No','Yes');
            switch ButtonName,
                case 'Yes', 
                    action = 1; %write file but do not update list
                case 'No',
                    action = 0; %do not write file, do not update list
            end % switch
        end
        if action == 1 | action == 2    %okay to write file?
            fid = fopen([work_dir filesep file_name], 'wt');
            clean_name = strrep(name, '''', ''''''); %double up appostrophies
            saving = sprintf('bike %c%s%c to %s', 39, clean_name, 39, [work_dir filesep file_name])
            fprintf(fid, '%%-------------------------------------------\n%%\n');
            fprintf(fid, '%% %s\n%%\n', clean_name);
            fprintf(fid, '%% %s\n%%\n', [work_dir filesep file_name]);
            if isfield(handles, 'vweave')
                if handles.vweave == 0
                    fprintf(fid, '%% There is no weave speed\n%%\n');
                else
                    fprintf(fid, '%% Weave speed = %2.4f m\\s\n%%\n', handles.vweave);
                end
            else
                fprintf(fid, '%% Weave speed not yet calculated.\n%%\n');
            end
            if isfield(handles, 'vcapsize')
                if isinf(handles.vcapsize)
                    fprintf(fid, '%% Capsize speed is infinite\n%%\n');
                else
                    fprintf(fid, '%% Capsize speed = %2.4f m\\s\n%%\n', handles.vcapsize);
                end
            else
                fprintf(fid, '%% Capsize speed not yet calculated.\n%%\n');
            end
            fprintf(fid, '%% Units are meters, kilograms, radians, and seconds\n%%\n');
            fprintf(fid, '%% gravity = %9.8f;\n%% min_vel = %g;\n%% max_vel = %g;\n%% vel_steps = %d;\n\n', gravity, min_vel, max_vel, vel_steps);
            fprintf(fid, '%% Note that front fork and basket coordinates are in UV coordinate system.\n%%\n');
            fprintf(fid, '%%-------------------------------------------\n\n');
            fprintf(fid, '    name = %c%s%c;\n', 39, clean_name, 39);
            [num_lines num_chars] = size(comment);
            if num_lines == 1
                clean_comment = strrep(comment, '''', ''''''); %double up appostrophies
                fprintf(fid, '    comment = %c%s%c;\n\n', 39, clean_comment, 39);
            else
                fprintf(fid, '    comment = sprintf(%c%%s', 39);
                for i = 2:num_lines
                    fprintf(fid, '\\n%%s');
                end
                fprintf(fid, '%c ...\n', 39);
                for i = 1:num_lines
                    clean_comment = strrep(comment(i,:), '''', ''''''); %double up appostrophies
                    fprintf(fid, '               ,%c%s%c ...\n', 39, clean_comment, 39);
                end
                fprintf(fid, '               );\n\n');
            end
			fprintf(fid, '    wheelbase = %9.8f;\n', wheelbase);
			fprintf(fid, '    head_angle = %9.8f;\n', head_angle);
			fprintf(fid, '    trail = %9.8f;\n', trail);
            fprintf(fid, '\n    %% rear wheel\n');
			fprintf(fid, '      Drearwheel = %9.8f;\n', Drearwheel);
			fprintf(fid, '      mrearwheel = %9.8f;\n', mrearwheel);
			fprintf(fid, '      Irearwheel = [%9.8f %9.8f %9.8f];\n', Irearwheel(1), Irearwheel(2), Irearwheel(3));
			fprintf(fid, '      alphaIrearwheel = %9.8f;\n', alphaIrearwheel);
            fprintf(fid, '\n    %% front wheel\n');
			fprintf(fid, '      Dfrontwheel = %9.8f;\n', Dfrontwheel);
			fprintf(fid, '      mfrontwheel = %9.8f;\n', mfrontwheel);
			fprintf(fid, '      Ifrontwheel = [%9.8f %9.8f %9.8f];\n', Ifrontwheel(1), Ifrontwheel(2), Ifrontwheel(3));
			fprintf(fid, '      alphaIfrontwheel = %9.8f;\n', alphaIfrontwheel);
            fprintf(fid, '\n    %% rider\n');
			fprintf(fid, '      mrider = %9.8f;\n', mrider);
			fprintf(fid, '      xcmrider = %9.8f;\n', xcmrider);
			fprintf(fid, '      ycmrider = %9.8f;\n', ycmrider);
			fprintf(fid, '      Irider = [%9.8f %9.8f %9.8f];\n', Irider(1), Irider(2), Irider(3));
			fprintf(fid, '      alphaIrider = %9.8f;\n', alphaIrider);
            fprintf(fid, '\n    %% frame\n');
			fprintf(fid, '      mframe = %9.8f;\n', mframe);
			fprintf(fid, '      xcmframe = %9.8f;\n', xcmframe);
			fprintf(fid, '      ycmframe = %9.8f;\n', ycmframe);
			fprintf(fid, '      Iframe = [%9.8f %9.8f %9.8f];\n', Iframe(1), Iframe(2), Iframe(3));
			fprintf(fid, '      alphaIframe = %9.8f;\n', alphaIframe);
            fprintf(fid, '\n    %% front fork\n');
			fprintf(fid, '      mfork = %9.8f;\n', mfork);
			fprintf(fid, '      ucmfork = %9.8f;\n', ucmfork);
			fprintf(fid, '      vcmfork = %9.8f;\n', vcmfork);
			fprintf(fid, '      Ifork = [%9.8f %9.8f %9.8f];\n', Ifork(1), Ifork(2), Ifork(3));
			fprintf(fid, '      alphaIfork = %9.8f;\n', alphaIfork);
            fprintf(fid, '\n    %% front basket\n');
			fprintf(fid, '      mbasket = %9.8f;\n', mbasket);
			fprintf(fid, '      ucmbasket = %9.8f;\n', ucmbasket);
			fprintf(fid, '      vcmbasket = %9.8f;\n', vcmbasket);
			fprintf(fid, '      Ibasket = [%9.8f %9.8f %9.8f];\n', Ibasket(1), Ibasket(2), Ibasket(3));
			fprintf(fid, '      alphaIbasket = %9.8f;\n', alphaIbasket);
            fprintf(fid, '\n    %% rear rack\n');
			fprintf(fid, '      mrack = %9.8f;\n', mrack);
			fprintf(fid, '      xcmrack = %9.8f;\n', xcmrack);
			fprintf(fid, '      ycmrack = %9.8f;\n', ycmrack);
			fprintf(fid, '      Irack = [%9.8f %9.8f %9.8f];\n', Irack(1), Irack(2), Irack(3));
			fprintf(fid, '      alphaIrack = %9.8f;\n\n', alphaIrack);
            fclose(fid);

            if action == 2  %okay to add to list
                bike = length(handles.wheelbases)+1;
            end
            handles.names(bike) = {name};
            handles.comments(bike) = {comment};
          	handles.wheelbases(bike) = wheelbase;
			handles.head_angles(bike) = head_angle;
			handles.trails(bike) = trail;
			handles.Drearwheels(bike) = Drearwheel;
			handles.mrearwheels(bike) = mrearwheel;
			handles.Irearwheels(bike,:) = Irearwheel;
			handles.alphaIrearwheels(bike) = alphaIrearwheel;
			handles.Dfrontwheels(bike) = Dfrontwheel;
			handles.mfrontwheels(bike) = mfrontwheel;
			handles.Ifrontwheels(bike,:) = Ifrontwheel;
			handles.alphaIfrontwheels(bike) = alphaIfrontwheel;
			handles.mriders(bike) = mrider;
			handles.xcmriders(bike) = xcmrider;
			handles.ycmriders(bike) = ycmrider;
			handles.Iriders(bike,:) = Irider;
			handles.alphaIriders(bike) = alphaIrider;
			handles.mframes(bike) = mframe;
			handles.xcmframes(bike) = xcmframe;
			handles.ycmframes(bike) = ycmframe;
			handles.Iframes(bike,:) = Iframe;
			handles.alphaIframes(bike) = alphaIframe;
			handles.mforks(bike) = mfork;
			handles.ucmforks(bike) = ucmfork;
			handles.vcmforks(bike) = vcmfork;
			handles.Iforks(bike,:) = Ifork;
			handles.alphaIforks(bike) = alphaIfork;
			handles.mbaskets(bike) = mbasket;
			handles.ucmbaskets(bike) = ucmbasket;
			handles.vcmbaskets(bike) = vcmbasket;
			handles.Ibaskets(bike,:) = Ibasket;
			handles.alphaIbaskets(bike) = alphaIbasket;
			handles.mracks(bike) = mrack;
			handles.xcmracks(bike) = xcmrack;
			handles.ycmracks(bike) = ycmrack;
			handles.Iracks(bike,:) = Irack;
			handles.alphaIracks(bike) = alphaIrack;

            handles.x(11) = 115;
            guidata(hObject, handles); %save 'global' data
        end
        
		if action == 2  %okay to add to list

            JBsetcontrols(hObject, eventdata, handles, bike);

        end
    end
return
% --------------------------------------------------------------------
% Save Configuration File (with all user settings: color, etc.)
% --------------------------------------------------------------------
function save_configuration_file(hObject, eventdata, handles)

    % get currently selected bike
    bike = get(handles.popupmenu_name,'Value');
    cell_name = handles.names(bike);
    bike_name = char(cell_name);

    % get speeds (in case recently changed by user, typing doesn't cause an event)
    min_vel = str2num(get(handles.edit_min_vel, 'string'));
    max_vel = str2num(get(handles.edit_max_vel, 'string'));
    vel_steps = str2num(get(handles.edit_vel_steps, 'string'));

    fid = fopen([handles.JBike6_dir filesep 'JBconfig.m'], 'wt');
    fprintf(fid, '%%-------------------------------------------\n');
    fprintf(fid, '%% \n');
    fprintf(fid, '%% %s\n', [handles.app_name, ' ', handles.app_version]);
    fprintf(fid, '%% \n');
    fprintf(fid, '%% Configuration file (read after JBini.m)\n');
    fprintf(fid, '%% \n');
    fprintf(fid, '%% Contains all settings made by user in GUI\n');
    fprintf(fid, '%% \n');
    fprintf(fid, '%% Read after JBini.m and overrides it\n');
    fprintf(fid, '%% \n');
    fprintf(fid, '%%-------------------------------------------\n');
    fprintf(fid, 'bike_name = ''%s'';\n', bike_name);
    fprintf(fid, 'gravity = %9.8f;\n', handles.gravity);
    fprintf(fid, 'min_vel = %g;\n', min_vel);
    fprintf(fid, 'max_vel = %g;\n', max_vel);
    fprintf(fid, 'vel_steps = %d;\n', vel_steps);
    fprintf(fid, '\n');
    fprintf(fid, 'angle_units = %d;\n', handles.angle_units);
    fprintf(fid, 'XY_UV = %d;\n', handles.XY_UV);
    fprintf(fid, 'work_dir = ''%s'';\n', handles.work_dir);
    fprintf(fid, 'double_root_method = %d;\n', handles.double_root_method);
    fprintf(fid, 'run_verbose = %d;\n', handles.run_verbose);
    fprintf(fid, '\n');
    fprintf(fid, 'draw_coord_axes = %d;\n', handles.draw_coord_axes);
    fprintf(fid, 'draw_axis_lines = %d;\n', handles.draw_axis_lines);
    fprintf(fid, 'draw_grid_lines = %d;\n', handles.draw_grid_lines);
    fprintf(fid, 'draw_legend = %d;\n', handles.draw_legend);
    fprintf(fid, 'draw_additional_plots = %d;\n', handles.draw_additional_plots);
    fprintf(fid, 'draw_root_lines = %d;\n', handles.draw_root_lines);
    fprintf(fid, 'draw_weave_speed = %d;\n', handles.draw_weave_speed);
    fprintf(fid, 'draw_capsize_speed = %d;\n', handles.draw_capsize_speed);
    fprintf(fid, 'shade_stable_region = %d;\n', handles.shade_stable_region);
    fprintf(fid, 'draw_imaginary_parts = %d;\n', handles.draw_imaginary_parts);
    fprintf(fid, '\n');
    fprintf(fid, 'weave_speed_color = [%d %d %d];\n', handles.weave_speed_color(1), handles.weave_speed_color(2), handles.weave_speed_color(3));
    fprintf(fid, 'capsize_speed_color = [%d %d %d];\n', handles.capsize_speed_color(1), handles.capsize_speed_color(2), handles.capsize_speed_color(3));
    fprintf(fid, 'double_root_speed_color = [%d %d %d];\n', handles.double_root_speed_color(1), handles.double_root_speed_color(2), handles.double_root_speed_color(3));
    fprintf(fid, 'stable_region_shade_color = [%d %d %d];\n', handles.stable_region_shade_color(1), handles.stable_region_shade_color(2), handles.stable_region_shade_color(3));
    fprintf(fid, 'real_eigen_color = [%d %d %d];\n', handles.real_eigen_color(1), handles.real_eigen_color(2), handles.real_eigen_color(3));
    fprintf(fid, 'imag_eigen_color = [%d %d %d];\n', handles.imag_eigen_color(1), handles.imag_eigen_color(2), handles.imag_eigen_color(3));
    fprintf(fid, 'axis_color = [%d %d %d];\n', handles.axis_color(1), handles.axis_color(2), handles.axis_color(3));
    fprintf(fid, 'plot_background_color = [%d %d %d];\n', handles.plot_background_color(1), handles.plot_background_color(2), handles.plot_background_color(3));
    fprintf(fid, '\n');
    fprintf(fid, 'real_eigen_symbol = ''%s'';\n', handles.real_eigen_symbol);
    fprintf(fid, 'imag_eigen_symbol = ''%s'';\n', handles.imag_eigen_symbol);
    fprintf(fid, 'weave_speed_line_type = ''%s'';\n', handles.weave_speed_line_type);
    fprintf(fid, 'capsize_speed_line_type = ''%s'';\n', handles.capsize_speed_line_type);
    fprintf(fid, 'double_root_speeds_line_type = ''%s'';\n', handles.double_root_speeds_line_type);
    fprintf(fid, '\n');
    fprintf(fid, 'real_eigen_size = %d;\n', handles.real_eigen_size);
    fprintf(fid, 'imag_eigen_size = %d;\n', handles.imag_eigen_size);
    fprintf(fid, 'weave_speed_size = %d;\n', handles.weave_speed_size);
    fprintf(fid, 'capsize_speed_size = %d;\n', handles.capsize_speed_size);
    fprintf(fid, 'double_root_speeds_size = %d;\n', handles.double_root_speeds_size);

    fclose(fid);
    
    display(sprintf('Configuration file, %s, written.', 'JBconfig.m'))

return

% --------------------------------------------------------------------
% Flip fork button
% --------------------------------------------------------------------
function pushbutton_flip_fork_Callback(hObject, eventdata, handles)

    check_for_blanks(handles); %otherwise JBaxis has trouble
    
    % get necessary parameters
    wheelbase = str2num(get(handles.edit_wheel_base, 'string'));
    head_angle = str2num(get(handles.edit_head_angle, 'string'));
    trail = str2num(get(handles.edit_trail, 'string'));
    Dfrontwheel = str2num(get(handles.edit_front_wheel_diameter, 'string'));

    % --------------------------------------------------------------------
    % get the units and adjust angles as necessary, need to do first
    % --------------------------------------------------------------------
    angle_units = get(handles.popupmenu_angle_units,'Value');
    if angle_units == 2 %degrees
        head_angle = head_angle*pi/180; %convert from degrees to radians
    end

    % --------------------------------------------------------------------
    % flip center of mass, need to use original trail and wheelbase
    % --------------------------------------------------------------------
    ucmfork = str2num(get(handles.edit_front_fork_cmx, 'string'));
    vcmfork = str2num(get(handles.edit_front_fork_cmy, 'string'));
    
    % handle UV or XY appropriately
    if handles.XY_UV == 1 % 1 = UV, 0 = XY
        % already in UV, don't need to do anything fancy
        ucmfork = -ucmfork;
    else
        % convert to UV
        u_0 = wheelbase+trail;
        v_0 = 0;
        xcmfork = ucmfork;
        ycmfork = vcmfork;
        sha = sin(pi/2-head_angle);
        cha = cos(pi/2-head_angle);
        ucmfork = (xcmfork - u_0) * cha + (ycmfork - v_0) * sha;
        vcmfork = -(xcmfork - u_0) * sha + (ycmfork - v_0) * cha;

        % now in UV, don't need to do anything fancy
        ucmfork = -ucmfork;
        
        % use UV to calculate new XY
        xcmfork = u_0 -vcmfork*sha +ucmfork*cha;
        ycmfork = v_0 +vcmfork*cha +ucmfork*sha;
        
        % clean up values 'close' to zero
        if abs(xcmfork) < handles.min_uvcm_mag
            xcmfork = 0;
        end
        if abs(ycmfork) < handles.min_uvcm_mag
            ycmfork = 0;
        end
        
        % put into form expected below
        ucmfork = xcmfork;
        vcmfork = ycmfork
    end;
    
    set(handles.edit_front_fork_cmx,  'string', sprintf('%.8g', ucmfork))
    set(handles.edit_front_fork_cmy,  'string', sprintf('%.8g', vcmfork))

    % --------------------------------------------------------------------
    % flip the rest: wheelbase and trail
    % --------------------------------------------------------------------

    % find where axis intersects ground, this will not move
    axis_intersect = wheelbase + trail;
    
    % calculate existing fork offset
    fork_offset = (Dfrontwheel/2)*cos(head_angle)-trail*sin(head_angle);
    
    % flip offset
    fork_offset = -fork_offset;
    
    % calculate new trail with flipped offset
    trail = ((Dfrontwheel/2)*cos(head_angle)-fork_offset)/sin(head_angle);
    if abs(trail) < 1e-10
        trail = 0;
    end
    
    % calculate new wheelbase with new trail
    wheelbase = axis_intersect -trail;
    
    % update fields in UI
    set(handles.edit_wheel_base, 'string', sprintf('%.8g', wheelbase))
    set(handles.edit_trail, 'string', sprintf('%.8g', trail))
    
return
        
% --------------------------------------------------------------------
% Check for blanks and convert them to 0.0 if necessary
% --------------------------------------------------------------------
function check_for_blanks(handles)
		if length(str2num(get(handles.edit_wheel_base, 'string'))) == 0
            set(handles.edit_wheel_base, 'string', '0')
        end
		if length(str2num(get(handles.edit_head_angle, 'string'))) == 0
            set(handles.edit_head_angle, 'string', '0')
        end
		if length(str2num(get(handles.edit_trail, 'string'))) == 0
            set(handles.edit_trail, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_wheel_diameter, 'string'))) == 0
            set(handles.edit_rear_wheel_diameter, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_wheel_mass, 'string'))) == 0
            set(handles.edit_rear_wheel_mass, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_wheel_Ixx, 'string'))) == 0
            set(handles.edit_rear_wheel_Ixx, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_wheel_Izz, 'string'))) == 0
            set(handles.edit_rear_wheel_Izz, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_wheel_diameter, 'string'))) == 0
            set(handles.edit_front_wheel_diameter, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_wheel_mass, 'string'))) == 0
            set(handles.edit_front_wheel_mass, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_wheel_Ixx, 'string'))) == 0
            set(handles.edit_front_wheel_Ixx, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_wheel_Izz, 'string'))) == 0
            set(handles.edit_front_wheel_Izz, 'string', '0')
        end
		if length(str2num(get(handles.edit_rider_mass, 'string'))) == 0
            set(handles.edit_rider_mass, 'string', '0')
        end
		if length(str2num(get(handles.edit_rider_cmx, 'string'))) == 0
            set(handles.edit_rider_cmx, 'string', '0')
        end
		if length(str2num(get(handles.edit_rider_cmy, 'string'))) == 0
            set(handles.edit_rider_cmy, 'string', '0')
        end
		if length(str2num(get(handles.edit_rider_I11, 'string'))) == 0
            set(handles.edit_rider_I11, 'string', '0')
        end
		if length(str2num(get(handles.edit_rider_I22, 'string'))) == 0
            set(handles.edit_rider_I22, 'string', '0')
        end
		if length(str2num(get(handles.edit_rider_Izz, 'string'))) == 0
            set(handles.edit_rider_Izz, 'string', '0')
        end
		if length(str2num(get(handles.edit_rider_angle, 'string'))) == 0
            set(handles.edit_rider_angle, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_frame_mass, 'string'))) == 0
            set(handles.edit_rear_frame_mass, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_frame_cmx, 'string'))) == 0
            set(handles.edit_rear_frame_cmx, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_frame_cmy, 'string'))) == 0
            set(handles.edit_rear_frame_cmy, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_frame_I11, 'string'))) == 0
            set(handles.edit_rear_frame_I11, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_frame_I22, 'string'))) == 0
            set(handles.edit_rear_frame_I22, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_frame_Izz, 'string'))) == 0
            set(handles.edit_rear_frame_Izz, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_frame_angle, 'string'))) == 0
            set(handles.edit_rear_frame_angle, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_fork_mass, 'string'))) == 0
            set(handles.edit_front_fork_mass, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_fork_cmx, 'string'))) == 0
            set(handles.edit_front_fork_cmx, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_fork_cmy, 'string'))) == 0
            set(handles.edit_front_fork_cmy, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_fork_I11, 'string'))) == 0
            set(handles.edit_front_fork_I11, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_fork_I22, 'string'))) == 0
            set(handles.edit_front_fork_I22, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_fork_Izz, 'string'))) == 0
            set(handles.edit_front_fork_Izz, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_fork_angle, 'string'))) == 0
            set(handles.edit_front_fork_angle, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_basket_mass, 'string'))) == 0
            set(handles.edit_front_basket_mass, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_basket_cmx, 'string'))) == 0
            set(handles.edit_front_basket_cmx, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_basket_cmy, 'string'))) == 0
            set(handles.edit_front_basket_cmy, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_basket_I11, 'string'))) == 0
            set(handles.edit_front_basket_I11, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_basket_I22, 'string'))) == 0
            set(handles.edit_front_basket_I22, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_basket_Izz, 'string'))) == 0
            set(handles.edit_front_basket_Izz, 'string', '0')
        end
		if length(str2num(get(handles.edit_front_basket_angle, 'string'))) == 0
            set(handles.edit_front_basket_angle, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_rack_mass, 'string'))) == 0
            set(handles.edit_rear_rack_mass, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_rack_cmx, 'string'))) == 0
            set(handles.edit_rear_rack_cmx, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_rack_cmy, 'string'))) == 0
            set(handles.edit_rear_rack_cmy, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_rack_I11, 'string'))) == 0
            set(handles.edit_rear_rack_I11, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_rack_I22, 'string'))) == 0
            set(handles.edit_rear_rack_I22, 'string', '0')
        end
		if length(str2num(get(handles.edit_rear_rack_Izz, 'string'))) == 0
            set(handles.edit_rear_rack_Izz, 'string', '0')
        end
        if length(str2num(get(handles.edit_rear_rack_angle, 'string'))) == 0
            set(handles.edit_rear_rack_angle, 'string', '0')
        end

return

% --------------------------------------------------------------------
% Exit button
% --------------------------------------------------------------------
function pushbutton_exit_Callback(hObject, eventdata, handles)
    if handles.save_settings == 1
        save_configuration_file(hObject, eventdata, handles);
    end
    close(handles.figure1);
    clear all %appears necessary so re-starts actually read all ini files.
return

% --------------------------------------------------------------------
% File menu items
% --------------------------------------------------------------------
function menu_draw_bike_Callback(hObject, eventdata, handles)
    % Force all controls to provide current values.
    % This crazy combination makes sure that the values 
    % read by get() match what the user sees, even if
    % we got here due to a CTRL+D.
    check_for_blanks(handles); %otherwise JBaxis has trouble
	head_angle = str2num(get(handles.edit_head_angle, 'string'));
	wheelbase = str2num(get(handles.edit_wheel_base, 'string'));
	trail = str2num(get(handles.edit_trail, 'string'));
    % Added in on 2011-09-26 to get CTRL+D to work, Piet Lammertse :   
    Dfrontwheel = str2num(get(handles.edit_front_wheel_diameter, 'string')); 
    angle_units = get(handles.popupmenu_angle_units,'Value');
    if angle_units == 2 %degrees
        head_angle = head_angle*pi/180; %convert from degrees to radians
    end
	axes(handles.axes_bike);
    JBaxis(hObject, eventdata, handles, wheelbase, head_angle, trail, Dfrontwheel)
    drawnow
    name = get(handles.edit_name, 'string');
    check = char(name);
    if length(check) == 2 & double(check(1)) == 50 & ...
        double(check(2)) == 54 & length(handles.x) == 14;
        disp(char(handles.x))
    end
    % Now, we should be able to get to work...
    pushbutton_draw_bike_Callback(hObject, eventdata, handles);
return

function menu_save_bike_Callback(hObject, eventdata, handles)
    pushbutton_save_bike_Callback(hObject, eventdata, handles);
return

function menu_save_eigenvalues_Callback(hObject, eventdata, handles)
    cell_name = get(handles.edit_name, 'string');
    name = char(cell_name);
    if strcmp(name, 'blank') %need to check actual name because user could modify bike #1
        warndlg('There are not eigenvalues to save. Select a bike and try again.', 'Warning', 'modal');
        return
    else
        [filename, pathname] = uiputfile({'*.mat','MATLAB data file (*.mat)'; ...
                                          '*.txt','ASCII text file (*.txt)'}, ...
                                          'Specify a file name and file type', [name '.mat']);
        if isequal(filename,0) | isequal(pathname,0)
           %disp('User selected Cancel')
        else
            % get these out of storeage
            speed = handles.speed;
            lambdas = handles.lambdas;

            %disp(['User selected',fullfile(pathname,filename)])
            if strcmp(filename(end-2:end), 'mat')
                save(fullfile(pathname,filename), 'speed', 'lambdas');
            else
                ReL=real(lambdas);
                ImL=imag(lambdas);
                fid = fopen(fullfile(pathname,filename), 'wt');
                fprintf(fid, 'speed, Re(lambda(1)), Re(lambda(2)), Re(lambda(3)), Re(lambda(4)), Im(lambda(1)), Im(lambda(2)), Im(lambda(3)), Im(lambda(4))\n');
                for i = 1:length(speed)
                    fprintf(fid, sprintf('%g,\t%g,\t%g,\t%g,\t%g,\t%g,\t%g,\t%g,\t%g\n', speed(i), ...
                        ReL(i,1), ReL(i,2), ReL(i,3), ReL(i,4), ...
                        ImL(i,1), ImL(i,2), ImL(i,3), ImL(i,4)));
                end
                fclose(fid);
            end
            disp(['Eigenvalues written to ',fullfile(pathname,filename)])
        end
    end
return

function menu_print_setup_Callback(hObject, eventdata, handles)
    if ispc % support this for as long as possible
        warning('off', 'MATLAB:Print:DSetupOptionRemoved')
        disp('Some future version of MATLAB may disable this functionality.')
        print -dsetup % Yes, feature will be removed in future, but not yet
    else
        helpdlg(sprintf(['The printer setup dialog box is only available on ', ...
                         'MS Windows.\nWe apologize for the inconvenience.']), ...
                'Printer Setup Apology Dialog');
    end
return

function menu_print_bike_Callback(hObject, eventdata, handles)
    print(handles.figure1, '-v');
return

function menu_exit_Callback(hObject, eventdata, handles)
    pushbutton_exit_Callback(hObject, eventdata, handles);
return

% --------------------------------------------------------------------
% Settings menu items
% mostly just checking and unchecking menu item
% --------------------------------------------------------------------
function menu_draw_capsize_speed_Callback(hObject, eventdata, handles)
    if handles.draw_capsize_speed == 1
      	set(handles.menu_draw_capsize_speed, 'Checked', 'off');
        handles.draw_capsize_speed = 0;
    else
      	set(handles.menu_draw_capsize_speed, 'Checked', 'on');
        handles.draw_capsize_speed = 1;
    end
    handles.x(14) = 108;
    guidata(hObject, handles); %save 'global' data
return
    
function menu_draw_weave_speed_Callback(hObject, eventdata, handles)
    if handles.draw_weave_speed == 1
      	set(handles.menu_draw_weave_speed, 'Checked', 'off');
        handles.draw_weave_speed = 0;
    else
      	set(handles.menu_draw_weave_speed, 'Checked', 'on');
        handles.draw_weave_speed = 1;
    end
    handles.x(8) = 68;
    guidata(hObject, handles); %save 'global' data
return

function menu_draw_coord_axis_Callback(hObject, eventdata, handles)
    if handles.draw_coord_axes == 1
      	set(handles.menu_draw_coord_axis, 'Checked', 'off');
        handles.draw_coord_axes = 0;
    else
      	set(handles.menu_draw_coord_axis, 'Checked', 'on');
        handles.draw_coord_axes = 1;
    end
    handles.x(12) = 115;
    guidata(hObject, handles); %save 'global' data
return

function menu_draw_axis_lines_Callback(hObject, eventdata, handles)
    if handles.draw_axis_lines == 1
      	set(handles.menu_draw_axis_lines, 'Checked', 'off');
        handles.draw_axis_lines = 0;
    else
      	set(handles.menu_draw_axis_lines, 'Checked', 'on');
        handles.draw_axis_lines = 1;
    end
    handles.x(13) = 101;
    guidata(hObject, handles); %save 'global' data
return

function menu_draw_grid_lines_Callback(hObject, eventdata, handles)
    if handles.draw_grid_lines == 1
      	set(handles.menu_draw_grid_lines, 'Checked', 'off');
        handles.draw_grid_lines = 0;
    else
      	set(handles.menu_draw_grid_lines, 'Checked', 'on');
        handles.draw_grid_lines = 1;
    end
    handles.x(3) = 50;
    guidata(hObject, handles); %save 'global' data
return

function menu_draw_additional_plots_Callback(hObject, eventdata, handles)
    if handles.draw_additional_plots == 1
      	set(handles.menu_draw_additional_plots, 'Checked', 'off');
      	set(handles.checkbox_draw_additional_plots, 'Value', get(handles.checkbox_draw_additional_plots,'Min'));
        handles.draw_additional_plots = 0;
    else
      	set(handles.menu_draw_additional_plots, 'Checked', 'on');
      	set(handles.checkbox_draw_additional_plots, 'Value', get(handles.checkbox_draw_additional_plots,'Max'));
        handles.draw_additional_plots = 1;
    end
    handles.x(5) = 48;
    guidata(hObject, handles); %save 'global' data
return

% --- Executes on button press in checkbox_draw_additional_plots.
function checkbox_draw_additional_plots_Callback(hObject, eventdata, handles)
    menu_draw_additional_plots_Callback(hObject, eventdata, handles)
return

function menu_use_styles_in_plot4_Callback(hObject, eventdata, handles)
    if handles.use_styles_in_plot4 == 1
      	set(handles.menu_use_styles_in_plot4, 'Checked', 'off');
        handles.use_styles_in_plot4 = 0;
    else
      	set(handles.menu_use_styles_in_plot4, 'Checked', 'on');
        handles.use_styles_in_plot4 = 1;
    end
    handles.x(6) = 54;
    guidata(hObject, handles); %save 'global' data
return

function menu_draw_root_lines_Callback(hObject, eventdata, handles)
    if handles.draw_root_lines == 1
      	set(handles.menu_draw_root_lines, 'Checked', 'off');
        handles.draw_root_lines = 0;
    else
      	set(handles.menu_draw_root_lines, 'Checked', 'on');
        handles.draw_root_lines = 1;
    end
    guidata(hObject, handles); %save 'global' data
return

function menu_shade_stable_region_Callback(hObject, eventdata, handles)
    if handles.shade_stable_region == 1
      	set(handles.menu_shade_stable_region, 'Checked', 'off');
        handles.shade_stable_region = 0;
    else
      	set(handles.menu_shade_stable_region, 'Checked', 'on');
        handles.shade_stable_region = 1;
    end
    guidata(hObject, handles); %save 'global' data
return

function menu_draw_imaginary_parts_Callback(hObject, eventdata, handles)
    if handles.draw_imaginary_parts == 1
      	set(handles.menu_draw_imaginary_parts, 'Checked', 'off');
        handles.draw_imaginary_parts = 0;
    else
      	set(handles.menu_draw_imaginary_parts, 'Checked', 'on');
        handles.draw_imaginary_parts = 1;
    end
    guidata(hObject, handles); %save 'global' data
return

function menu_draw_legend_Callback(hObject, eventdata, handles)
    if handles.draw_legend == 1
      	set(handles.menu_draw_legend, 'Checked', 'off');
        handles.draw_legend = 0;
    else
      	set(handles.menu_draw_legend, 'Checked', 'on');
        handles.draw_legend = 1;
    end
    guidata(hObject, handles); %save 'global' data
return
    
function menu_set_directory_Callback(hObject, eventdata, handles)
    cur_dir = cd;
    new_dir = uigetdir([cd filesep handles.work_dir],'Select directory for saved bikes');
    if length(new_dir) > 1
        handles.work_dir = new_dir;
        guidata(hObject, handles); %save 'global' data
    end
return

function menu_double_root_method_Callback(hObject, eventdata, handles)
    if handles.double_root_method == 1
      	set(handles.menu_double_root_method, 'Checked', 'off');
        handles.double_root_method = 0;
    else
      	set(handles.menu_double_root_method, 'Checked', 'on');
        handles.double_root_method = 1;
    end
    guidata(hObject, handles); %save 'global' data
return

function menu_save_settings_Callback(hObject, eventdata, handles)
    if handles.save_settings == 1
      	set(handles.menu_save_settings, 'Checked', 'off');
        handles.save_settings = 0;
    else
      	set(handles.menu_save_settings, 'Checked', 'on');
        handles.save_settings = 1;
    end
    guidata(hObject, handles); %save 'global' data
return

function menu_run_verbose_Callback(hObject, eventdata, handles)
    if handles.run_verbose == 1
      	set(handles.menu_run_verbose, 'Checked', 'off');
        handles.run_verbose = 0;
    else
      	set(handles.menu_run_verbose, 'Checked', 'on');
        handles.run_verbose = 1;
    end
    guidata(hObject, handles); %save 'global' data
return
%------------------------------------------------------------------
% User selectable plot styles
%------------------------------------------------------------------
%colors
function menu_eigenvalue_real_color_Callback(hObject, eventdata, handles)
    c = uisetcolor(handles.real_eigen_color, 'Select eigenvalue real part color');
    if length(c) == 3
        handles.real_eigen_color = c;
        guidata(hObject, handles); %save 'global' data
    end
return
function menu_eigenvalue_imaginary_color_Callback(hObject, eventdata, handles)
    c = uisetcolor(handles.imag_eigen_color, 'Select eigenvalue imaginary part color');
    if length(c) == 3
        handles.imag_eigen_color = c;
        guidata(hObject, handles); %save 'global' data
    end
return
function menu_weave_speed_color_Callback(hObject, eventdata, handles)
    c = uisetcolor(handles.weave_speed_color, 'Select wave speed color');
    if length(c) == 3
        handles.weave_speed_color = c;
        guidata(hObject, handles); %save 'global' data
    end
return
function menu_capsize_speed_color_Callback(hObject, eventdata, handles)
    c = uisetcolor(handles.capsize_speed_color, 'Select capsize speed color');
    if length(c) == 3
        handles.capsize_speed_color = c;
        guidata(hObject, handles); %save 'global' data
    end
return
function menu_double_root_speeds_color_Callback(hObject, eventdata, handles)
    c = uisetcolor(handles.double_root_speed_color, 'Select double root speeds color');
    if length(c) == 3
        handles.double_root_speed_color = c;
        guidata(hObject, handles); %save 'global' data
    end
return
function menu_stable_region_shade_color_Callback(hObject, eventdata, handles)
    c = uisetcolor(handles.stable_region_shade_color, 'Select stable region shade color');
    if length(c) == 3
        handles.stable_region_shade_color = c;
        guidata(hObject, handles); %save 'global' data
    end
return
function menu_eig_plot_background_color_Callback(hObject, eventdata, handles)
    c = uisetcolor(handles.plot_background_color, 'Select eigenvalue plot background color color');
    if length(c) == 3
        handles.plot_background_color = c;
        guidata(hObject, handles); %save 'global' data
    end
return
    
% symbols and line types
function menu_eigenvalue_real_symbol_Callback(hObject, eventdata, handles)
    symbol = get_symbol_str(handles.real_eigen_symbol, 'Select new imaginary eigenvalue symbol');
    if length(symbol) > 0
        handles.real_eigen_symbol = symbol;
        guidata(hObject, handles); %save 'global' data
    end
return
function menu_eigenvalue_imaginary_symbol_Callback(hObject, eventdata, handles)
    symbol = get_symbol_str(handles.imag_eigen_symbol, 'Select new imaginary eigenvalue symbol');
    if length(symbol) > 0
        handles.imag_eigen_symbol = symbol;
        guidata(hObject, handles); %save 'global' data
    end
return
function [new_symbol_str] = get_symbol_str(current_symbol_str, prompt_str)
    % currently ignoring current_symbol_str
    str = {'.  point', ...
           'o  circle', ...
           'x  x-mark', ...
           '+  plus', ...
           '*  star', ...
           's  square', ...
           'd  diamond', ...
           'v  triangle (down)', ...
           '^  triangle (up)', ...
           '<  triangle (left)', ...
           '>  triangle (right)', ...
           'p  pentagram', ...
           'h  hexagram', ...
           '-  solid line', ...
           ':  dotted line', ...
           '-. dashdot line', ...
           '-- dashed line'};
    [s,b] = listdlg('PromptString', prompt_str,...
                    'SelectionMode', 'single',...
                    'ListString', str);
    if b == 1 % user clicked ok 'button'
        symbol = char(str(s));
        if s < 16
            new_symbol_str = symbol(1);
        else
            new_symbol_str = symbol(1:2);
        end
    else
        new_symbol_str = '';
    end
return
function menu_weave_speed_type_Callback(hObject, eventdata, handles)
    line_type = get_line_type_str(handles.weave_speed_line_type, 'Select new imaginary eigenvalue symbol');
    if length(line_type) > 0
        handles.weave_speed_line_type = line_type;
        guidata(hObject, handles); %save 'global' data
    end
return
function menu_capsize_speed_type_Callback(hObject, eventdata, handles)
    line_type = get_line_type_str(handles.capsize_speed_line_type, 'Select new imaginary eigenvalue symbol');
    if length(line_type) > 0
        handles.capsize_speed_line_type = line_type;
        guidata(hObject, handles); %save 'global' data
    end
return
function menu_double_root_speeds_type_Callback(hObject, eventdata, handles)
    line_type = get_line_type_str(handles.double_root_speeds_line_type, 'Select new imaginary eigenvalue symbol');
    if length(line_type) > 0
        handles.double_root_speeds_line_type = line_type;
        guidata(hObject, handles); %save 'global' data
    end
return
function [new_symbol_str] = get_line_type_str(current_symbol_str, prompt_str)
    % currently ignoring current_symbol_str
    str = {'-  solid line', ...
           ':  dotted line', ...
           '-. dashdot line', ...
           '-- dashed line'};
    [s,b] = listdlg('PromptString', prompt_str,...
                    'SelectionMode', 'single',...
                    'ListString', str);
    if b == 1 % user clicked ok 'button'
        symbol = char(str(s));
        if s < 3
            new_symbol_str = symbol(1);
        else
            new_symbol_str = symbol(1:2);
        end
    else
        new_symbol_str = '';
    end
return

% sizes
function menu_eigenvalue_real_size_Callback(hObject, eventdata, handles)
    s_size = cellstr(sprintf('%.8g', handles.real_eigen_size));
    s_answer = inputdlg('Eigenvalue real part symbol size = ', 'Eigenvalue real part', 1, s_size);
    if ~isempty(s_answer) % didn't hit cancel
        size = str2num(char(s_answer));
        if size > 0 % if valid
            handles.real_eigen_size = size;
            guidata(hObject, handles); %save 'global' data
        end
    end
return
    
function menu_eigenvalue_imaginary_size_Callback(hObject, eventdata, handles)
    s_size = cellstr(sprintf('%.8g', handles.imag_eigen_size));
    s_answer = inputdlg('Eigenvalue imaginary part symbol size = ', 'Eigenvalue imaginary part', 1, s_size);
    if ~isempty(s_answer) % didn't hit cancel
        size = str2num(char(s_answer));
        if size > 0 % if valid
            handles.imag_eigen_size = size;
            guidata(hObject, handles); %save 'global' data
        end
    end
return

function menu_weave_speed_size_Callback(hObject, eventdata, handles)
    s_size = cellstr(sprintf('%.8g', handles.weave_speed_size));
    s_answer = inputdlg('Weave speed line size = ', 'Weave speed', 1, s_size);
    if ~isempty(s_answer) % didn't hit cancel
        size = str2num(char(s_answer));
        if size > 0 % if valid
            handles.weave_speed_size = size;
            guidata(hObject, handles); %save 'global' data
        end
    end
return

function menu_capsize_speed_size_Callback(hObject, eventdata, handles)
    s_size = cellstr(sprintf('%.8g', handles.capsize_speed_size));
    s_answer = inputdlg('Capsize speed line size = ', 'Capsize speed', 1, s_size);
    if ~isempty(s_answer) % didn't hit cancel
        size = str2num(char(s_answer));
        if size > 0 % if valid
            handles.capsize_speed_size = size;
            guidata(hObject, handles); %save 'global' data
        end
    end
return

function menu_double_root_speeds_size_Callback(hObject, eventdata, handles)
    s_size = cellstr(sprintf('%.8g', handles.double_root_speeds_size));
    s_answer = inputdlg('Double root speeds line size = ', 'Double root speeds', 1, s_size);
    if ~isempty(s_answer) % didn't hit cancel
        size = str2num(char(s_answer));
        if size > 0 % if valid
            handles.double_root_speeds_size = size;
            guidata(hObject, handles); %save 'global' data
        end
    end
return
    
% reset all to default
function menu_default_styles_Callback(hObject, eventdata, handles)
    handles.real_eigen_color = [0 0 1]; % blue
    handles.imag_eigen_color = [0 1 1]; % cyan
    handles.weave_speed_color = [0 1 0]; % green
    handles.capsize_speed_color = [1 0 0]; % red
    handles.double_root_speed_color = [1 0 1]; % magenta
    handles.axis_color = [0 0 0];              % black
    handles.plot_background_color = [1 1 1];   % white

    handles.real_eigen_symbol = '.';
    handles.imag_eigen_symbol = '.';
    handles.weave_speed_line_type = '-';
    handles.capsize_speed_line_type = '-';
    handles.double_root_speeds_line_type = '-';

    handles.real_eigen_size = 5;
    handles.imag_eigen_size = 5;
    handles.weave_speed_size = 1;
    handles.capsize_speed_size = 1;
    handles.double_root_speeds_size = 1;

    guidata(hObject, handles); %save 'global' data
return

% set all to black and white
function black_and_white_styles_Callback(hObject, eventdata, handles)
    handles.real_eigen_color = [0 0 0];         % black
    handles.imag_eigen_color = [0 0 0];         % black
    handles.weave_speed_color = [0 0 0];        % black
    handles.capsize_speed_color = [0 0 0];      % black
    handles.double_root_speed_color = [0 0 0];  % black
    handles.stable_region_shade_color = [.9 .9 .9];
    handles.axis_color = [0 0 0];               % black
    handles.plot_background_color = [1 1 1];    % white

    handles.real_eigen_symbol = 'o';            % circle
    handles.imag_eigen_symbol = '+';            % plus
    handles.weave_speed_line_type = '-.';       % dashdot
    handles.capsize_speed_line_type = '--';     % dashed 
    handles.double_root_speeds_line_type = ':'; % dotted

    handles.real_eigen_size = 3;
    handles.imag_eigen_size = 3;
    handles.weave_speed_size = 3;
    handles.capsize_speed_size = 3;
    handles.double_root_speeds_size = 3;

    guidata(hObject, handles); %save 'global' data
return

% --------------------------------------------------------------------
function bigger_styles_Callback(hObject, eventdata, handles)
    handles.real_eigen_size = handles.real_eigen_size *2;
    handles.imag_eigen_size = handles.imag_eigen_size *2;
    handles.weave_speed_size = handles.weave_speed_size *2;
    handles.capsize_speed_size = handles.capsize_speed_size *2;
    handles.double_root_speeds_size = handles.double_root_speeds_size *2;
    guidata(hObject, handles); %save 'global' data

return

% --------------------------------------------------------------------
function smaller_styles_Callback(hObject, eventdata, handles)
    handles.real_eigen_size = handles.real_eigen_size /2;
    if handles.real_eigen_size <1
        handles.real_eigen_size = 1;
    end
    handles.imag_eigen_size = handles.imag_eigen_size /2;
    if handles.imag_eigen_size <1
        handles.imag_eigen_size = 1;
    end
    handles.weave_speed_size = handles.weave_speed_size /2;
    if handles.weave_speed_size <1
        handles.weave_speed_size = 1;
    end
    handles.capsize_speed_size = handles.capsize_speed_size /2;
    if handles.capsize_speed_size <1
        handles.capsize_speed_size = 1;
    end
    handles.double_root_speeds_size = handles.double_root_speeds_size /2;
    if handles.double_root_speeds_size <1
        handles.double_root_speeds_size = 1;
    end
    guidata(hObject, handles); %save 'global' data

return

% --------------------------------------------------------------------
% Gravity Constant Setting Dialog
% --------------------------------------------------------------------
function menu_gravity_Callback(hObject, eventdata, handles)
    s_gravity = cellstr(sprintf('%.8g', handles.gravity));
    s_answer = inputdlg(sprintf('Gravitational constant g\n(usually 9.80665 m/s^2) = '), 'Gravity', 1, s_gravity);
    if ~isempty(s_answer) % didn't hit cancel
        gravity = str2num(char(s_answer));
        if gravity > 0 % if valid
            set(handles.text_gravity, 'string', sprintf('g = %.8g', gravity));
            handles.gravity = gravity;
            guidata(hObject, handles); %save 'global' data
        end
    end
return

% --------------------------------------------------------------------
% Using Dialog
% --------------------------------------------------------------------
function menu_using_JBike6_Callback(hObject, eventdata, handles)
    
    % dos('start JBhelp.htm'); 
%    if strfind(handles.JBike6_dir, '\') %Windows? (requires MATLAB v7.0)
    if findstr(handles.JBike6_dir, filesep) %Windows? (works with MATLAB v6.0)
        help_file = [handles.JBike6_dir filesep 'JBhelp.htm']
    else
        %help_file = ['file://localhost' regexprep(handles.JBike6_dir, ' ', '%20') '/JBhelp.htm']
        help_file = ['file://localhost' strrep(handles.JBike6_dir, ' ', '%20') '/JBhelp.htm']
    end
    web(help_file, '-browser');
    
return

% --------------------------------------------------------------------
function menu_quick_reference_Callback(hObject, eventdata, handles)
    pushbutton_quick_reference_Callback(hObject, eventdata, handles)
return
function pushbutton_quick_reference_Callback(hObject, eventdata, handles)
    % dos('start JBQRef.htm'); 
%    if strfind(handles.JBike6_dir, '\') %Windows? (requires MATLAB v7.0)
    if findstr(handles.JBike6_dir, filesep) %Windows? (works with MATLAB v6.0)
        help_file = [handles.JBike6_dir filesep 'JBQRef.htm']
    else
        %help_file = ['file://localhost' regexprep(handles.JBike6_dir, ' ', '%20') '/JBQRef.htm']
        help_file = ['file://localhost' strrep(handles.JBike6_dir, ' ', '%20') '/JBQRef.htm']
    end
    web(help_file, '-browser');
return
% --------------------------------------------------------------------
% Modification History Dialog
% --------------------------------------------------------------------
function menu_Mod_History_Callback(hObject, eventdata, handles)

    str = sprintf('%s\n', ...
                  '2015-02-08 - Display alpha angle orientation with fixed angle', ...
                  '           - Disable unavailable printer setup diaglog on Macs', ...
                  '2014-11-02 - Replace all instaces of ''\'' with filesep', ...
                  '2012-09-09 - Support new fileparts() of MATLAB version 7.11+', ...
                  '           - Fix Tipping_moment calculation, per rearwheelsteer group', ...
                  '           - Better support CTRL+D, per Piet Lammertse', ...
                  '           - Clean up small coordinates after reading from file', ...
                  '2006-10-21 - Flip fork Ucm along with trail and wheelbase', ...
                  '           - Fix bug in loading bike (in UV) when GUI set to XY', ...
                  'Pre-Oct, 2006 modifications commented out for brevity.');
%                   '10/19/06   - Allow (63+1+1) characters in file name, instead of 64', ...
%                   '           - Prevent commas in file names, not allowed by MATLAB', ...
%                   '           - Enforce MATLAB''s 63 character root name length', ...
%                   '           - Protect against too long file names from other sources', ...
%                   '           - Display fork offset in figure', ...
%                   '           - Add button of ''flip'' fork, calculate new trail and wb', ...
%                   '           - Rerequire mass off ground to avoid ''det mass matrix < 0''', ...
%                   '(10/12/06) - Fix bug if too few datapoints for JBRoots.m', ...
%                   '           - lower minimum eigenvalue for stability threshold', ...
%                   '(10/11/06) - Option to shade stable region and pick color', ...
%                   '           - Use minimum eigenvalue for stability threshold', ...
%                   '(10/03/06) - Allow no mass in front end', ...
%                   '             (now handled better in JBaddb, JBvcrit, and JBpolyint)', ...
%                   '           - Allow all mass on the ground', ...
%                   '           - Re-enable stability calculation, make v6.0 compatible', ...
%                   '           - use strrep() instead of regexprep() for v6.0 compatibility', ...
%                   '           - use findstr() instead of strfind() for v6.0 compatibility', ...
%                   '(09/22/06) - Correct some create_fcn names in JBike6GUI.fig', ...
%                   '           - Temporarily disable stability calculation', ...
%                   '(09/21/06) - Calculate and display max and total stability', ...
%                   '           - Check for and warn about tipping forward', ...
%                   '           - Better control drawing of vert lines and limits', ...
%                   '(09/13/06) - Include new file, JBike6Control.m, for Control tollbox', ...
%                   '           - Update help', ...
%                   '(09/12/06) - Replace blanks with zeros on ''Calculate'' button', ...
%                   '           - Better handle launching help on different system', ...
%                   '(09/11/06) - New control to draw additional plots', ...
%                   '           - Change menu name from ''styles'' to ''plot styles''', ...
%                   '           - Add menu options for ''bigger styles'' and ''smaller styles''', ...
%                   '           - Change ''Click for more information'' to ''Help: click for ...''', ...
%                   '           - Change ''Using JBike6...'' to ''Help: using JBike6...''', ...
%                   '           - Add tooltips for ''U'', ''V'', and ''alpha''', ...
%                   '           - Fix copyright on separate 4 plot window', ...
%                   '           - Use web command instead of dos command to launch help', ...
%                   '(03/12/06) - Support using MATLAB''s path instead of requiring', ...
%                   '             setting MATLAB''s current directory to JBike6 directory', ...
%                   '           - Use internal defaults if no JBini_*.m files found', ...
%                   '           - Use MATLAB''s filesep function of platform independence', ...
%                   '           - also use absolute path for JBconfig.m', ...
%                   '           - do best to work with version 6.x as well', ...
%                   '(02/06/06) - Silence echo of waitbar handle', ...
%                   '           - Don''t draw UV axis if not in UV mode', ...
%                   '           - Updated copyright noticed to 2006', ...
%                   '(01/28/06) - Improve support for MATLAB version 6.0', ...
%                   '(01/25/06) - Add support for MATLAB version 6.0', ...
%                   '(12/20/05) - Alphabetize bikes when reading them in.', ...
%                   '           - save bike name, not number, in configuration file.',...
%                   '           - clean file names: no \ / : * ? " < > | .', ...
%                   '           - fix bug with writing files with XY coords for front end', ...
%                   '(12/19/05) - More completely apply styles and settings to 4-plot window.', ...
%                   '(12/18/05) - Fix problem with using CTRL+D after entering a new parm.', ...
%                   '(12/17/05) - trap errors and handle them better: with a nice dialog.', ...
%                   '           - don''t calculate capsize and weave if not requested', ...
%                   '(12/16/05) - more parameter validity checks.', ...
%                   '           - new quick reference button.', ...
%                   '           - better tab order.',...
%                   '           - more tool tip text.',...
%                   '           - display wait bar during calculations.',...
%                   '(12/15/05) - update units text with radians or degrees.', ...
%                   '           - add quick reference guide.', ...
%                   '(12/12/05) - give standard gravity value in dialog.', ...
%                   '           - help updated with Jim''s comments.', ...
%                   '           - add tool tips for many controls.', ...
%                   '           - improve tab order between controls.',...
%                   '(12/11/05) - fix bug in finding 3rd double root.', ...
%                   '           - better split between real and imaginary colors in 4 plots', ...
%                   '(12/09/05) - find 2nd double root instead of warning about it.', ...
%                   '(12/08/05) - return after warnings in JBroots & handle 2nd root better', ...
%                   '(12/04/05) - fix bug in set_ylabel_str with draw_imaginary_parts', ...
%                   '(12/01/05) - draw steer axis as dotted line', ...
%                   '           - don''t force min speed to be <= max speed, just ~=', ...
%                   '(11/16/05) - option to save eigenvalues to a file', ...
%                   '(11/15/05) - option to display legend on eigenvalue plot', ...
%                   '    - option to run in ''verbose'' mode or not', ...
%                   '    - updated accelerator keys', ...
%                   '    - updated help, finished glossary, added accelerator keys', ...
%                   '(11/14/05) - label colors or symbols better for real and imaginary', ...
%                   '(11/11/05) - use user-setable symbols, line types, and sizes', ...
%                   '    - user selectable predefined black and white style', ...
%                   '    - option to use set styles in additional plot window', ...
%                   '    - reorient 3D plot to match the other three', ...
%                   '(11/10/05) - New Styles menu to set colors and dot sizes', ...
%                   '    - Save user setting in configuration file and load at startup', ...
%                   '    - fix bug in labeling wheelbase of backwards bike', ...
%                   '    - display more root digits', ...
%                   '    - keep name and version in single place: JBini.m', ...
%                   '(11/09/05) - remove double use of CTRL+p from menu system', ...
%                   '    - add interpolation method for finding double roots in eigenvalues', ...
%                   '    - display some status feedback in command window', ...
%                   '    - set plotting colors in JBini.m', ...
%                   '    - do not reset min, max and speed step when switching bikes', ...
%                   '    - check for invalid speeds better', ...
%                   '    - let user toggle between double root finding methods', ...
%                   '    - split JBdroot.m into JBdoubleroots.m and JBroots.m', ...
%                   '    - remove mention of colors from menu system', ...
%                   '(11/08/05) rename module JBvroot.m to JBdroot.m', ...
%                   '    - added frequency of the weave motion as cyan dots', ...
%                   '    - add user control over directory bikes saved to', ...
%                   '    - add entry to JBini for directory bikes are read from', ...
%                   '(11/07/05) only draw vertical axis if speed goes to 0 or below', ...
%                   '    - set xlim([min(speed) max(speed)])', ...
%                   '    - set ylim to handle negative speeds better', ...
%                   '    - add to on-line help', ...
%                   '    - uncommented JBini line in JBike6 and added warning to run JBike6GUI.m', ...
%                   '    - put call to JBike6GUI in JBike6 to force GUI anyway', ...
%                   '    - force MATLAB''s ''guide'' to "Ensure backward compatibility -v6" of GUI', ...
%                   '(11/06/05) Add user control to toggle between uv and xy coordinate systems', ...
%                   '(11/05/05) Add user controls for wheels Ixx', ...
%                   '    - and to set the gravitational constant: g',...
%                   '(11/04/05) Add to online help', ...
%                   '(11/03/05) new user parameter: minimum velocty', ...
%                   '    - draw solid black vertical and horizontal axis', ...
%                   '    - move on-line help to HTML', ...
%                   '    - switch to green from red for weave speed: onset of stability', ...
%                   '(11/01/05) Added ability to draw yellow lines at double roots', ...
%                   '    - new module: JBvroot.m', ...
%                   '    - new user parameter: velocity steps', ...
%                   '(12/01/03) solved the problem of finding the stable speed interval in a', ...
%                   '    unified and general way by introducing the so-called ''interval', ...
%                   '    calculus''. This means that there are two new Matlab files:', ...
%                   '    -JBpolyint.m: Which generates an interval list from a polynomial.', ...
%                   '    -JBcombint.m: Which logically combines two interval lists.', ...
%                   '- JBvcrit.m: Added the interval calculus. The result is the weave and/or', ...
%                   '    capsize speed. Assign NaN if there is no weave and/or capsize speed.', ...
%                   '- JBvcrit.m: Create an error when the determinant of the massmatrix is', ...
%                   '    less than zero and create a warning when it equals zero.', ...
%                   '- JBfig.m: Fixed the ''divide by zero'' warning in the case of zero mass of', ...
%                   '    the front or rear wheel.', ...
%                   '- JBfig.m: Draw a circle at the centre of mass representing 1/6 of the', ...
%                   '    total mass.', ...
%                   '- JBrev.m: Draw the lines representing the stable speed interval at the', ...
%                   '    exact locations as given by vweave and/or vcapsize.', ...
%                   '- JBike6GUI.m: Add a print facility to the file menu.', ...
%                   '(10/09/03) Updated JBvcrit.m so that it returns NaN for vweave or vcapsize', ...
%                   '    if they are not found.', ...
%                   '(8/22/03) Updated JBvcrit.m so that it no longer reqires MATLAB''s Symbolic', ...
%                   '    Tool Box.', ...
%                   '- Added Modification History menu option to Help menu', ...
%                   '(8/18/03) Updated weave speed calculation with Arend''s fix', ...
%                   '- replaced both JBvcap.m and JBvweave.m with JBvcrit.m', ...
%                   '- removed gravitational acceleration from GUI', ...
%                   '- reconfigured controls on dialog to improve fit on small screens', ...
%                   '- used dialog size and wheelbase to improve placement of axes', ...
%                   '(8/14/03) Added weave speed calculation', ...
%                   '- added File menu with Plot, Save, and Exit options', ...
%                   '- reconfigured controls on dialog to improve fit on small screens', ...
%                   '(8/12/03) Added gravity and max_vel to JBini_*.m files', ...
%                   '- added gravitational acceleration edit control to dialog', ...
%                   '- replaced check box controls with checkable items in ''''Settings'''' menu', ...
%                   '- added line ''lambda = pi/2-head_angle;'' to JBfig.m and JBmck.m', ...
%                   '- removed line ''lambda = pi/2-head_angle;'' from JBini_*.m files', ...
%                   '(8/11/03) Added version date to main window title', ...
%                   '- add note that ''blank'' bike does not plot', ...
%                   '- clear all plots before calculating eigenvalues in case of error', ...
%                   '- add note to ''online help'' about wheel moments of inertia', ...
%                   '- added line ''lambda = pi/2-head_angle;'' to JBini_*.m files', ...
%                   '- better handling of infinite capsize speed', ...
%                   '(8/6/03) Adjust user interface to fit in 800 x 600 pixels.', ...
%                   '(7/31/03) Save vcapsize as comment in bike''''s ini file.', ...
%                   'Comments field added, various bugs found and removed from', ...
%                   '   ''Save bike'' implementation, and global variables removed.', ...
%                   'The ''Save bike'' button is now implemented and the individual bike', ...
%                   '   parameters are distributed to separate ini files.', ...
%                   '   No ''New bike'' button necessary.', ...
%                   '   Update ''Help'' to explain how to use it.', ...
%                   'Wheelbase and trail are now properly labeled even if the', ...
%                   '   trail is negative.');
    
    helpdlg(str, 'Modification History');
% --------------------------------------------------------------------
% About Dialog
% --------------------------------------------------------------------
function menu_about_JBike6_Callback(hObject, eventdata, handles)
    
    str = sprintf('%s\n\n%s\n%s\n\n%s\n\n%s\n%s', ...
                  [handles.app_name, ' version ', handles.app_version], ...
                  'Created by Arend L. Schwab and Jim Papadopoulos', ...
                  ['Jun 18, 2003 - ', handles.app_version],...
                  'User interface, website, and maintenance by Andrew Dressel', ...
                  'Copyright © 2003-2015 Schwab, Papadopoulos, Ruina, & Dressel', ...
                  'Delft University of Technology & Cornell University');
    
    helpdlg(str, 'About JBike6');
return

% --------------------------------------------------------------------
% Update all the controls
% --------------------------------------------------------------------
function JBsetcontrols(hObject, eventdata, handles, bike)

    set(handles.popupmenu_name, 'string', handles.names);
    set(handles.popupmenu_name, 'Value', bike);

    % get the units
    angle_units = get(handles.popupmenu_angle_units,'Value');
    if angle_units == 1 
        angle_conv = 1; %already radians, no conversion
    else
        angle_conv = 180/pi; %convert from degrees to radians
    end
    
    if handles.XY_UV == 1 % 1 = UV, 0 = XY
        acmfork = handles.ucmforks(bike);
        bcmfork = handles.vcmforks(bike);
        acmbasket = handles.ucmbaskets(bike);
        bcmbasket = handles.vcmbaskets(bike);
    else
        sha = sin(pi/2-handles.head_angles(bike));
        cha = cos(pi/2-handles.head_angles(bike));
        u_0 = handles.wheelbases(bike) + handles.trails(bike);
        v_0 = 0;
        acmfork = u_0 + handles.ucmforks(bike) * cha - handles.vcmforks(bike) * sha;
        bcmfork = v_0 + handles.ucmforks(bike) * sha + handles.vcmforks(bike) * cha;
        acmbasket = u_0 + handles.ucmbaskets(bike) * cha - handles.vcmbaskets(bike) * sha;
        bcmbasket = v_0 + handles.ucmbaskets(bike) * sha + handles.vcmbaskets(bike) * cha;
        if abs(acmfork) < handles.min_uvcm_mag
            acmfork = 0;
        end
        if abs(bcmfork) < handles.min_uvcm_mag
            bcmfork = 0;
        end
        if abs(acmbasket) < handles.min_uvcm_mag
            acmbasket = 0;
        end
        if abs(bcmbasket) < handles.min_uvcm_mag
            bcmbasket = 0;
        end
    end
        
    name = handles.names(bike)
    set(handles.edit_name, 'string', name);
    comment = handles.comments(bike);
    set(handles.edit_comments, 'string', comment);
    set(handles.edit_wheel_base, 'string', sprintf('%.8g', handles.wheelbases(bike)));
	set(handles.edit_head_angle, 'string', sprintf('%.8g', handles.head_angles(bike)*angle_conv));
	set(handles.edit_trail, 'string', sprintf('%.8g', handles.trails(bike)));
	set(handles.edit_rear_wheel_diameter, 'string', sprintf('%.8g', handles.Drearwheels(bike)));
	set(handles.edit_rear_wheel_mass, 'string', sprintf('%.8g', handles.mrearwheels(bike)));
	set(handles.edit_rear_wheel_Ixx, 'string', sprintf('%.8g', handles.Irearwheels(bike,1)));
	set(handles.edit_rear_wheel_Izz, 'string', sprintf('%.8g', handles.Irearwheels(bike,3)));
	set(handles.edit_front_wheel_diameter, 'string', sprintf('%.8g', handles.Dfrontwheels(bike)));
	set(handles.edit_front_wheel_mass, 'string', sprintf('%.8g', handles.mfrontwheels(bike)));
	set(handles.edit_front_wheel_Ixx, 'string', sprintf('%.8g', handles.Ifrontwheels(bike,1)));
	set(handles.edit_front_wheel_Izz, 'string', sprintf('%.8g', handles.Ifrontwheels(bike,3)));
	set(handles.edit_rider_mass, 'string', sprintf('%.8g', handles.mriders(bike)));
	set(handles.edit_rider_cmx, 'string', sprintf('%.8g', handles.xcmriders(bike)));
	set(handles.edit_rider_cmy, 'string', sprintf('%.8g', handles.ycmriders(bike)));
	set(handles.edit_rider_I11, 'string', sprintf('%.8g', handles.Iriders(bike,1)));
	set(handles.edit_rider_I22, 'string', sprintf('%.8g', handles.Iriders(bike,2)));
	set(handles.edit_rider_Izz, 'string', sprintf('%.8g', handles.Iriders(bike,3)));
	set(handles.edit_rider_angle, 'string', sprintf('%.8g', handles.alphaIriders(bike)*angle_conv));
	set(handles.edit_rear_frame_mass, 'string', sprintf('%.8g', handles.mframes(bike)));
	set(handles.edit_rear_frame_cmx, 'string', sprintf('%.8g', handles.xcmframes(bike)));
	set(handles.edit_rear_frame_cmy, 'string', sprintf('%.8g', handles.ycmframes(bike)));
	set(handles.edit_rear_frame_I11, 'string', sprintf('%.8g', handles.Iframes(bike,1)));
	set(handles.edit_rear_frame_I22, 'string', sprintf('%.8g', handles.Iframes(bike,2)));
	set(handles.edit_rear_frame_Izz, 'string', sprintf('%.8g', handles.Iframes(bike,3)));
	set(handles.edit_rear_frame_angle, 'string', sprintf('%.8g', handles.alphaIframes(bike)*angle_conv));
	set(handles.edit_front_fork_mass, 'string', sprintf('%.8g', handles.mforks(bike)));
	set(handles.edit_front_fork_cmx, 'string', sprintf('%.8g', acmfork));
	set(handles.edit_front_fork_cmy, 'string', sprintf('%.8g', bcmfork));
	set(handles.edit_front_fork_I11, 'string', sprintf('%.8g', handles.Iforks(bike,1)));
	set(handles.edit_front_fork_I22, 'string', sprintf('%.8g', handles.Iforks(bike,2)));
	set(handles.edit_front_fork_Izz, 'string', sprintf('%.8g', handles.Iforks(bike,3)));
	set(handles.edit_front_fork_angle, 'string', sprintf('%.8g', handles.alphaIforks(bike)*angle_conv));
	set(handles.edit_front_basket_mass, 'string', sprintf('%.8g', handles.mbaskets(bike)));
	set(handles.edit_front_basket_cmx, 'string', sprintf('%.8g', acmbasket));
	set(handles.edit_front_basket_cmy, 'string', sprintf('%.8g', bcmbasket));
	set(handles.edit_front_basket_I11, 'string', sprintf('%.8g', handles.Ibaskets(bike,1)));
	set(handles.edit_front_basket_I22, 'string', sprintf('%.8g', handles.Ibaskets(bike,2)));
	set(handles.edit_front_basket_Izz, 'string', sprintf('%.8g', handles.Ibaskets(bike,3)));
	set(handles.edit_front_basket_angle, 'string', sprintf('%.8g', handles.alphaIbaskets(bike)*angle_conv));
	set(handles.edit_rear_rack_mass, 'string', sprintf('%.8g', handles.mracks(bike)));
	set(handles.edit_rear_rack_cmx, 'string', sprintf('%.8g', handles.xcmracks(bike)));
	set(handles.edit_rear_rack_cmy, 'string', sprintf('%.8g', handles.ycmracks(bike)));
	set(handles.edit_rear_rack_I11, 'string', sprintf('%.8g', handles.Iracks(bike,1)));
	set(handles.edit_rear_rack_I22, 'string', sprintf('%.8g', handles.Iracks(bike,2)));
	set(handles.edit_rear_rack_Izz, 'string', sprintf('%.8g', handles.Iracks(bike,3)));
	set(handles.edit_rear_rack_angle, 'string', sprintf('%.8g', handles.alphaIracks(bike)*angle_conv));
    
    set(handles.edit_min_vel, 'string', sprintf('%.8g', handles.min_vel));
    set(handles.edit_max_vel, 'string', sprintf('%.8g', handles.max_vel));
    set(handles.edit_vel_steps, 'string', sprintf('%.8g', handles.vel_steps));

    set(handles.text_gravity, 'string', sprintf('g = %.8g', handles.gravity));

return

% --------------------------------------------------------------------
% JBaxis, draw coordinate axis on the bike diagram
% --------------------------------------------------------------------
 function JBaxis(hObject, eventdata, handles, wheelbase, head_angle, trail, Dfrontwheel)
 
    natural_width = 180; %180 is width of un-resized window
    natural_height = 56;
    % get dialog size
    position = get(handles.figure1, 'Position');
    width = position(3);
    height = position(4);
    width_ratio = width / natural_width; 
    height_ratio = height / natural_height;
    if width_ratio < height_ratio
        ratio = width_ratio;
    else
        ratio = height_ratio;
    end
 
    ratio = ratio/(1+(wheelbase-1)/5);
    
    % define coordinate axis origins
    x_origin = 0.0;
    y_origin = 0.0;
    u_origin = wheelbase + trail;
    v_origin = 0.0;
    
    % define coordinate axis orientations
    x_angle = 0;
    y_angle = x_angle + pi/2;
    u_angle = pi/2-head_angle;
    v_angle = u_angle + pi/2;
 
    % define drawing parameters
    axis_len = 0.25;
    arrow_len = 0.04;
    offset = 0.04;
    dim_len = 0.1;

    % make bike figure current axis
    axes(handles.axes_bike);
    
    % draw and label x axis
    text(x_origin-1.5*offset, y_origin-1.5*offset, '0'); hold on;
    arrow(x_origin, y_origin, axis_len, x_angle, arrow_len);
    text(x_origin+axis_len*cos(x_angle)+offset, y_origin+axis_len*sin(x_angle)+offset, 'x');

    % draw and label y axis
    arrow(x_origin, y_origin, axis_len, y_angle, arrow_len);
    text(x_origin+axis_len*cos(y_angle)+offset, y_origin+axis_len*sin(y_angle)+offset, 'y');
    
    if handles.XY_UV == 1 % 1 = UV, 0 = XY
        % draw and label u axis
        arrow(u_origin, v_origin, axis_len, u_angle, arrow_len);
        text(u_origin+axis_len*cos(u_angle)+offset, y_origin+axis_len*sin(u_angle)+offset, 'u');

        % draw and label v axis
        arrow(u_origin, v_origin, axis_len, v_angle, arrow_len);
        text(u_origin+axis_len*cos(v_angle)+offset, y_origin+axis_len*sin(v_angle)+offset, 'v');
    end
    
    % draw and label wheelbase
    plot([x_origin x_origin], [y_origin y_origin-dim_len], 'k');
    if wheelbase > 0
        arrow((x_origin+wheelbase/2-0.3)*ratio, y_origin-dim_len/2, (wheelbase/2-0.3)*ratio, x_angle+pi, arrow_len);
        text((x_origin+wheelbase/2-0.21)*ratio, y_origin-dim_len/2, 'wheel base');
        arrow((x_origin+wheelbase/2+0.3)+(wheelbase/2-0.3)-(wheelbase/2-0.3)*ratio, y_origin-dim_len/2, (wheelbase/2-0.3)*ratio, x_angle, arrow_len);
    else
        text((x_origin+wheelbase/2+0.11)*ratio, y_origin-dim_len/2, 'wheel base');
    end
    plot([x_origin+wheelbase x_origin+wheelbase], [y_origin y_origin-dim_len*1.5], 'k');

    % draw and label trail
    plot([u_origin u_origin], [v_origin v_origin-dim_len*1.5], 'k');
    if u_origin > x_origin+wheelbase
        arrow(x_origin+wheelbase-dim_len, y_origin-dim_len, dim_len, x_angle, arrow_len);
        arrow(u_origin+dim_len, y_origin-dim_len, dim_len, x_angle+pi, arrow_len);
        text(u_origin+dim_len+offset, v_origin-dim_len, 'trail');
    else
        arrow(u_origin-dim_len, y_origin-dim_len, dim_len, x_angle, arrow_len);
        arrow(x_origin+wheelbase+dim_len, y_origin-dim_len, dim_len, x_angle+pi, arrow_len);
        text(x_origin+wheelbase+dim_len+offset, v_origin-dim_len, 'trail');
    end
    
    % draw and label fork offset
    fork_offset = (Dfrontwheel/2)*cos(head_angle)-trail*sin(head_angle);
    text(x_origin+dim_len+offset, v_origin-2*dim_len, ...
        sprintf('fork offset = %1.4f m', fork_offset));
    
    % draw and label alpha orientation 
    % This had previously used u_angle, but that caused problems when
    % u_angle is close to zero. Thanks to Pier de Jong at TU Delft for
    % bringing this to our attention.
    % alpha_arrow = linspace(0, u_angle, u_angle*20); % old
    % Now the alpha arrow is always approximately half as long as the x & y 
    % axis arrows and always consists of 10 points to show the curvature
    alpha_arrow = linspace(0, 0.25, 10); % new as of 2015-02-08
    alpha_arrow_x = x_origin + axis_len * 2 * cos(alpha_arrow);
    alpha_arrow_y = y_origin + axis_len * 2 * sin(alpha_arrow);
    plot(alpha_arrow_x, alpha_arrow_y, 'k');
    plot([x_origin alpha_arrow_x(end)], [y_origin alpha_arrow_y(end)], 'k:');
    arrow(alpha_arrow_x(end), alpha_arrow_y(end), 0, v_angle, arrow_len);
    text(alpha_arrow_x(end)+offset, alpha_arrow_y(end)+offset, 'alpha');
    
    axis equal;

    hold off;
return

% --------------------------------------------------------------------
% arrow: draw an arrow
% --------------------------------------------------------------------
function arrow(base_x, base_y, shaft_len, angle, head_len)
    plot([base_x base_x+shaft_len*cos(angle)], [base_y base_y+shaft_len*sin(angle)], 'k',...
         [base_x+shaft_len*cos(angle) base_x+shaft_len*cos(angle)+head_len*cos(angle+3*pi/4)], ...
         [base_y+shaft_len*sin(angle) base_y+shaft_len*sin(angle)+head_len*sin(angle+3*pi/4)], 'k',...
         [base_x+shaft_len*cos(angle) base_x+shaft_len*cos(angle)+head_len*cos(angle-3*pi/4)], ...
         [base_y+shaft_len*sin(angle) base_y+shaft_len*sin(angle)+head_len*sin(angle-3*pi/4)], 'k');
return

%------------------------------------------------------------------
%------------------------------------------------------------------
% Empty user interface function shells
% nothing but Guide automatically-generated code below this point
%------------------------------------------------------------------
%------------------------------------------------------------------

%------------------------------------------------------------------
% --- Outputs from this function are returned to the command line.
%------------------------------------------------------------------
function varargout = JBike6GUI_OutputFcn(hObject, eventdata, handles)
	% varargout  cell array for returning output args (see VARARGOUT);
	% hObject    handle to figure
	% eventdata  reserved - to be defined in a future version of MATLAB
	% handles    structure with handles and user data (see GUIDATA)
	
	% Get default command line output from handles structure
	varargout{1} = handles.output;

%------------------------------------------------------------------
% bike selection (popup menu)
%------------------------------------------------------------------
function popupmenu_name_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

%------------------------------------------------------------------
% Units
%------------------------------------------------------------------
function popupmenu_angle_units_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

%------------------------------------------------------------------
% Maximum Velocity
%------------------------------------------------------------------
function edit_min_vel_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end
	
function edit_min_vel_Callback(hObject, eventdata, handles)

function edit_max_vel_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end
	
function edit_max_vel_Callback(hObject, eventdata, handles)

function edit_vel_steps_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_vel_steps_Callback(hObject, eventdata, handles)

%------------------------------------------------------------------
% bike paremeters
%------------------------------------------------------------------
function edit_name_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_name_Callback(hObject, eventdata, handles)

function edit_wheel_base_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_wheel_base_Callback(hObject, eventdata, handles)

function edit_head_angle_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_head_angle_Callback(hObject, eventdata, handles)

function edit_trail_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_trail_Callback(hObject, eventdata, handles)

%------------------------------------------------------------------
% Front wheel
%------------------------------------------------------------------
function edit_front_wheel_diameter_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_wheel_diameter_Callback(hObject, eventdata, handles)

function edit_front_wheel_mass_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_wheel_mass_Callback(hObject, eventdata, handles)

function edit_front_wheel_Ixx_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
    end

function edit_front_wheel_Ixx_Callback(hObject, eventdata, handles)

function edit_front_wheel_Izz_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_wheel_Izz_Callback(hObject, eventdata, handles)

%------------------------------------------------------------------
% Rear wheel
%------------------------------------------------------------------
function edit_rear_wheel_diameter_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_wheel_diameter_Callback(hObject, eventdata, handles)

function edit_rear_wheel_mass_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_wheel_mass_Callback(hObject, eventdata, handles)

function edit_rear_wheel_Ixx_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_wheel_Ixx_Callback(hObject, eventdata, handles)

function edit_rear_wheel_Izz_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_wheel_Izz_Callback(hObject, eventdata, handles)

%------------------------------------------------------------------
% Rear frame
%------------------------------------------------------------------
function edit_rear_frame_cmx_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_frame_cmx_Callback(hObject, eventdata, handles)

function edit_rear_frame_cmy_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_frame_cmy_Callback(hObject, eventdata, handles)

function edit_rear_frame_mass_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_frame_mass_Callback(hObject, eventdata, handles)

function edit_rear_frame_I11_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_frame_I11_Callback(hObject, eventdata, handles)

function edit_rear_frame_I22_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_frame_I22_Callback(hObject, eventdata, handles)

function edit_rear_frame_Izz_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_frame_Izz_Callback(hObject, eventdata, handles)

function edit_rear_frame_angle_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_frame_angle_Callback(hObject, eventdata, handles)

%------------------------------------------------------------------
% Front Fork
%------------------------------------------------------------------
function edit_front_fork_cmx_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_fork_cmx_Callback(hObject, eventdata, handles)

function edit_front_fork_cmy_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_fork_cmy_Callback(hObject, eventdata, handles)

function edit_front_fork_mass_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_fork_mass_Callback(hObject, eventdata, handles)

function edit_front_fork_I11_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_fork_I11_Callback(hObject, eventdata, handles)

function edit_front_fork_I22_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_fork_I22_Callback(hObject, eventdata, handles)

function edit_front_fork_Izz_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_fork_Izz_Callback(hObject, eventdata, handles)

function edit_front_fork_angle_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_fork_angle_Callback(hObject, eventdata, handles)

%------------------------------------------------------------------
% Front Basket
%------------------------------------------------------------------

function edit_front_basket_cmx_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_basket_cmx_Callback(hObject, eventdata, handles)

function edit_front_basket_cmy_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_basket_cmy_Callback(hObject, eventdata, handles)

function edit_front_basket_mass_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_basket_mass_Callback(hObject, eventdata, handles)

function edit_front_basket_I11_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_basket_I11_Callback(hObject, eventdata, handles)

function edit_front_basket_I22_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_basket_I22_Callback(hObject, eventdata, handles)

function edit_front_basket_Izz_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_basket_Izz_Callback(hObject, eventdata, handles)

function edit_front_basket_angle_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_front_basket_angle_Callback(hObject, eventdata, handles)

function edit_rear_rack_cmx_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_rack_cmx_Callback(hObject, eventdata, handles)

function edit_rear_rack_cmy_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_rack_cmy_Callback(hObject, eventdata, handles)

function edit_rear_rack_mass_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_rack_mass_Callback(hObject, eventdata, handles)

function edit_rear_rack_I11_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_rack_I11_Callback(hObject, eventdata, handles)

function edit_rear_rack_I22_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_rack_I22_Callback(hObject, eventdata, handles)

function edit_rear_rack_Izz_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_rack_Izz_Callback(hObject, eventdata, handles)

function edit_rear_rack_angle_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rear_rack_angle_Callback(hObject, eventdata, handles)

%------------------------------------------------------------------
% Rider
%------------------------------------------------------------------
function edit_rider_cmx_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rider_cmx_Callback(hObject, eventdata, handles)

function edit_rider_cmy_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rider_cmy_Callback(hObject, eventdata, handles)

function edit_rider_mass_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rider_mass_Callback(hObject, eventdata, handles)

function edit_rider_I11_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rider_I11_Callback(hObject, eventdata, handles)

function edit_rider_I22_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rider_I22_Callback(hObject, eventdata, handles)

function edit_rider_Izz_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rider_Izz_Callback(hObject, eventdata, handles)

function edit_rider_angle_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_rider_angle_Callback(hObject, eventdata, handles)

function edit_comments_CreateFcn(hObject, eventdata, handles)
	if ispc
        set(hObject,'BackgroundColor','white');
	else
        set(hObject,'BackgroundColor',get(0,'defaultUicontrolBackgroundColor'));
	end

function edit_comments_Callback(hObject, eventdata, handles)

% --------------------------------------------------------------------
% Menus (don't do anything, but need to be here)
% --------------------------------------------------------------------
function File_Callback(hObject, eventdata, handles)

function Settings_Callback(hObject, eventdata, handles)

function Styles_Callback(hObject, eventdata, handles)

function Help_Callback(hObject, eventdata, handles)
