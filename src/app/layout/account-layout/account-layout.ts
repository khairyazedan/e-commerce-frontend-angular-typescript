import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../features/account/components/navbar/navbar';
import { ControlSide } from '../../features/account/components/control-side/control-side';

@Component({
  imports: [RouterOutlet, Navbar, ControlSide],
  selector: 'app-account-layout',
  styleUrl: './account-layout.css',
  templateUrl: './account-layout.html',
}) 
export class AccountLayout {}
