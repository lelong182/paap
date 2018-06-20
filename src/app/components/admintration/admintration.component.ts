import {Component, OnInit} from '@angular/core';
import {TransportService} from "../../services/transport.service";
import {Title} from "@angular/platform-browser";

@Component({
  templateUrl: './admintration.component.html'
})
export class AdmintrationComponent implements OnInit {

  listTransport: any = [];

  constructor(private title: Title,
              private transportService: TransportService) {
    title.setTitle('PAAP | Quản trị');
  }

  ngOnInit() {
    let self = this;
    self.transportService.getList({getAll: true}).subscribe(
      res => {
        if (res.success) {
          self.listTransport = res.data.records;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  deleteTransport(id) {
    if (confirm("Bạn có muốn xóa loại vận chuyển này không?")) {
      let self = this;
      self.transportService.delete(id).subscribe(
        res => {
          if (res.success) {
            window.location.reload();
          }
        },
        err => {
          console.log(err);
        }
      );
    }
  }

}
