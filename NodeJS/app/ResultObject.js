module.exports = class ResultObject {

    setError(error){
        this.success = false;
        this.error = error;
        return this;
    }

    setSuccess(result){
        this.success = true;
        this.result = result;
        return this;
    }
}