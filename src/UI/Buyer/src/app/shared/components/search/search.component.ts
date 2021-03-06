import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { debounceTime, takeWhile, filter } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'shared-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  alive = true;
  @Input() placeholderText?: string;
  @Output() searched = new EventEmitter<string>();
  faSearch = faSearch;
  faTimes = faTimes;
  form: FormGroup;
  previousSearchTerm = '';

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({ search: '' });
    this.onFormChanges();
    this.onQueryParamChanges();
  }

  private onFormChanges() {
    this.form.controls['search'].valueChanges
      .pipe(
        filter((searchTerm) => {
          const searchTermChanged = searchTerm !== this.previousSearchTerm;
          const onProductListPage = this.router.url === '/products';
          return searchTermChanged && onProductListPage;
        }),
        debounceTime(500),
        takeWhile(() => this.alive)
      )
      .subscribe((searchTerm) => {
        this.previousSearchTerm = searchTerm;
        this.search();
      });
  }

  private search() {
    const searchTerm = this.form.controls.search.value;
    // emit as undefined if empty string so sdk ignores parameter completely
    this.searched.emit(searchTerm || undefined);
  }

  private onQueryParamChanges() {
    // clear search bar if products are no longer filtered by search term
    this.activatedRoute.queryParams
      .pipe(
        filter((queryParams) => typeof queryParams.search === 'undefined'),
        takeWhile(() => this.alive)
      )
      .subscribe(() => {
        this.form.controls['search'].setValue('');
      });
  }

  showClear(): boolean {
    return this.form.get('search').value !== '';
  }

  clear(): void {
    this.form.setValue({ search: '' });
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
