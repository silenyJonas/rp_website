import { Component } from '@angular/core';
import { AdminRoutingModule } from "../../../admin/admin-routing.module";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tos',
  imports: [AdminRoutingModule,RouterLink],
  templateUrl: './tos.component.html',
  styleUrl: './tos.component.css'
})
export class TosComponent {

}
