import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ControlSidebar } from '../../features/admin/components/control-sidebar/control-sidebar';
import { Navbar } from '../../features/admin/components/navbar/navbar';


@Component({
  imports: [RouterOutlet, ControlSidebar, Navbar],
  selector: 'app-admin-layout',
  styleUrl: './admin-layout.css',
  templateUrl: './admin-layout.html',
})
export class AdminLayout {}
