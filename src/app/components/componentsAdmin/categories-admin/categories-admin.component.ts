import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-categories-admin',
  templateUrl: './categories-admin.component.html',
  styleUrls: ['./categories-admin.component.scss'],
  standalone: false
})
export class CategoriesAdminComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Admin' },
    { label: 'Catégories', active: true }
  ];

  categories = [
    { id: 1, name: 'Électronique', icon: 'ri-computer-line',      color: 'primary', products: 45, active: true  },
    { id: 2, name: 'Mode',         icon: 'ri-t-shirt-line',        color: 'info',    products: 32, active: true  },
    { id: 3, name: 'Maison',       icon: 'ri-home-4-line',         color: 'success', products: 28, active: true  },
    { id: 4, name: 'Sport',        icon: 'ri-football-line',       color: 'warning', products: 19, active: true  },
    { id: 5, name: 'Beauté',       icon: 'ri-heart-line',          color: 'danger',  products: 24, active: true  },
    { id: 6, name: 'Jouets',       icon: 'ri-gamepad-line',        color: 'primary', products: 15, active: false },
    { id: 7, name: 'Alimentation', icon: 'ri-restaurant-line',     color: 'success', products: 38, active: true  },
    { id: 8, name: 'Autre',        icon: 'ri-more-line',           color: 'secondary', products: 7, active: true },
  ];

  showForm = false;
  editingId: number | null = null;
  submitted = false;
  form!: FormGroup;

  iconOptions = [
    'ri-computer-line', 'ri-t-shirt-line', 'ri-home-4-line', 'ri-football-line',
    'ri-heart-line', 'ri-gamepad-line', 'ri-restaurant-line', 'ri-more-line',
    'ri-car-line', 'ri-book-line', 'ri-music-line', 'ri-camera-line'
  ];

  colorOptions = ['primary', 'info', 'success', 'warning', 'danger', 'secondary'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(cat?: any) {
    this.form = this.fb.group({
      name:  [cat?.name  || '', [Validators.required, Validators.minLength(2)]],
      icon:  [cat?.icon  || 'ri-more-line', Validators.required],
      color: [cat?.color || 'primary',      Validators.required],
    });
  }

  get f() { return this.form.controls; }

  openAdd() {
    this.editingId = null;
    this.submitted = false;
    this.initForm();
    this.showForm = true;
  }

  openEdit(cat: any) {
    this.editingId = cat.id;
    this.submitted = false;
    this.initForm(cat);
    this.showForm = true;
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) return;
    if (this.editingId) {
      const c = this.categories.find(c => c.id === this.editingId);
      if (c) Object.assign(c, this.form.value);
    } else {
      this.categories.push({
        id: Date.now(), ...this.form.value, products: 0, active: true
      });
    }
    this.showForm = false;
    this.submitted = false;
  }

  cancel() {
    this.showForm = false;
    this.submitted = false;
  }

  toggleActive(cat: any) {
    cat.active = !cat.active;
  }

  delete(cat: any) {
    this.categories = this.categories.filter(c => c.id !== cat.id);
  }
}
