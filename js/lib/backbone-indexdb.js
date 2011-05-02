/**
 * License
 *
 *(The MIT License)
 *
 * Copyright (c) 2011 Anton Podviaznikov <podviaznikov@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
"use strict";
Porridge.Model = Backbone.Model.extend(
{
    initialize:function()
    {
        if(!this.get('id'))
        {
            this.id=UUID.generate();
            this.set({id:this.id});
        }
    },
    save:function()
    {
        var entityName = this.constructor.definition.name;
        var keyName = this.constructor.definition.key||'id';
        Porridge.save(entityName,this.toJSON(),this.get(keyName));
    },
    destroy:function()
    {
        var entityName = this.constructor.definition.name;
        var keyName = this.constructor.definition.key||'id';
        var model = this;
        var success=function()
        {
            model.trigger('destroy', model, model.collection);
        }
        Porridge.remove(entityName,this.get(keyName),success);
    }
},
{
    definition:{}
});
Porridge.Collection = Backbone.Collection.extend(
{
    fetch:function(options)
    {
        options || (options = {});
        var collection = this;
        var entityName = this.model.definition.name;
        var addOne = function(data)
        {
            collection.add(new collection.model({attributes:data}));
        }
        Porridge.all(entityName,addOne,function()
        {
            collection.trigger('retrieved');
        },options.error);
    },
    fetchByKey:function(keyName,keyValue)
    {
        var collection = this;
        var entityName = this.model.definition.name;
        var addOne = function(data)
        {
            collection.add(new collection.model({attributes:data}));
        }
        Porridge.allByKey(entityName,keyName,keyValue,addOne,function()
        {
            collection.trigger('retrieved');
        });
    }
});